(async () => {
  'use strict';

  // One mile is valued at one US cent. Reject currencies we cannot convert.
  // DOM text joins USD, the two-character airline code, and the seat count.
  const parseTotal = (text) => {
    const values = [...text.replace(/\u00a0/g, ' ').matchAll(/(?<![\d.,])(\d{1,3}(?:,\d{3})+|\d+)\s*pts\s*\+\s*\$\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?\s+USD(?=\b|(?:[A-Z0-9]{2})?\d+\s+seats?)/g)];
    if (values.length !== 1) return null;
    const [, points, dollars, cents = '00'] = values[0];
    const totalCents = Number(points.replaceAll(',', '')) + Number(dollars.replaceAll(',', '')) * 100 + Number(cents);
    return Number.isSafeInteger(totalCents) ? (totalCents / 100).toFixed(2) : null;
  };
  const TARGET = '[data-slot="cabin-price-badge"]';
  const KEY = '__seatsAeroTotal';
  const OWN = 'data-seats-aero-total';
  if (location.hostname !== 'seats.aero' && !location.hostname.endsWith('.seats.aero')) {
    alert('請在 seats.aero 的搜尋結果頁使用此書籤。');
    return;
  }
  window[KEY]?.stop();
  const badges = [...document.querySelectorAll(TARGET)].filter(el => el.getClientRects().length);
  if (!badges.length) {
    alert('找不到里數標籤，請先開啟 seats.aero 搜尋結果。');
    return;
  }

  let stopped = false;
  let active = null;
  let observer;
  let expiry;
  const labels = [];
  const panel = document.createElement('div');
  panel.setAttribute(OWN, 'panel');
  Object.assign(panel.style, {
    position: 'fixed', bottom: '16px', right: '16px', zIndex: '2147483647',
    background: '#18212f', color: '#fff', border: '1px solid #64748b',
    borderRadius: '8px', padding: '12px', font: '13px/1.5 system-ui', maxWidth: '340px'
  });
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  const close = document.createElement('button');
  close.textContent = '關閉／清除';
  close.style.cssText = 'margin-left:10px;cursor:pointer;color:inherit;background:transparent;border:1px solid #64748b;border-radius:4px';
  panel.append(status, close);
  document.body.append(panel);

  const hover = (el, enter) => {
    const rect = el.getBoundingClientRect();
    const init = { bubbles: true, pointerType: 'mouse', clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
    for (const type of enter ? ['pointerover', 'pointerenter', 'pointermove'] : ['pointerout', 'pointerleave']) {
      el.dispatchEvent(new PointerEvent(type, { ...init, bubbles: !type.endsWith('enter') && !type.endsWith('leave') }));
    }
  };
  const stop = () => {
    stopped = true;
    observer?.disconnect();
    clearTimeout(expiry);
    if (active) { hover(active, false); active = null; }
    labels.forEach(el => el.remove());
    panel.remove();
    if (window[KEY]?.stop === stop) delete window[KEY];
  };
  window[KEY] = { stop };
  close.onclick = stop;
  // Clean up annotations after a bounded session, or immediately on another run.
  expiry = setTimeout(stop, 10 * 60 * 1000);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const tables = [...new Set(badges.map(el => el.closest('table')).filter(Boolean))];
  const fingerprint = () => tables.map(table => {
    const copy = table.cloneNode(true);
    copy.querySelectorAll(`[${OWN}], [data-reka-popper-content-wrapper]`).forEach(el => el.remove());
    return copy.textContent;
  }).join('\n');
  const initial = fingerprint();
  const current = () => badges.every(el => el.isConnected) && fingerprint() === initial;
  let count = 0;
  let attempted = 0;
  const deadline = Date.now() + 90000;
  try {
    for (const badge of badges) {
      if (stopped || Date.now() > deadline || !current()) break;
      attempted++;
      status.textContent = `計算中 ${attempted}/${badges.length}，請暫時將滑鼠移離表格…`;
      active = badge;
      hover(badge, true);
      let total = null;
      let text = '';
      const until = Date.now() + 1400;
      while (!stopped && Date.now() < until) {
        // Only read the tooltip explicitly associated with this exact badge.
        const ids = (badge.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
        text = ids.map(id => document.getElementById(id)?.textContent || '').join(' ');
        total = parseTotal(text);
        if (total !== null) break;
        await sleep(80);
      }
      hover(badge, false);
      active = null;
      if (stopped || !current()) break;
      if (total !== null) {
        const label = document.createElement('span');
        label.setAttribute(OWN, 'value');
        label.textContent = `≈ US$${total}`;
        label.title = `每里 US$0.01 ＋ 附加費；${text}`;
        label.style.cssText = 'display:inline-block;margin:3px 0 3px 6px;color:#34d399;font:600 12px/1.4 system-ui;white-space:nowrap';
        // Keep the annotation outside the site's interactive tooltip trigger.
        const host = badge.closest('button') || badge;
        host.after(label);
        labels.push(label);
        count++;
      }
      await sleep(100);
    }
    if (stopped) return;
    if (!current()) {
      labels.forEach(el => el.remove());
      status.textContent = '搜尋結果已更新，請再點一次書籤重新計算。';
      return;
    }
    status.textContent = count
      ? `已顯示 ${count}/${badges.length} 筆總額（每里 US$0.01）。換頁後請重跑；10 分鐘後清除。`
      : '未取得 USD 費用。網站可能未接受模擬滑鼠事件，請提供展開後 tooltip 的 HTML。';
    // Invalidate stale totals when a live search, sorting, or pagination changes data.
    observer = new MutationObserver(() => {
      if (!current()) {
        labels.forEach(el => el.remove());
        observer.disconnect();
        status.textContent = '搜尋結果已更新，舊總額已清除。請再點一次書籤。';
      }
    });
    tables.forEach(table => observer.observe(table.parentElement, { subtree: true, childList: true, characterData: true }));
  } catch (error) {
    if (stopped) return;
    if (active) { hover(active, false); active = null; }
    labels.forEach(el => el.remove());
    status.textContent = `無法完成計算：${error.message}`;
  }
})();
