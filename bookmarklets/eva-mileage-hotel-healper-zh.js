(function () {
  /* EVA Mileage Hotel - Mileage Value Calculator */

  const TOOL_ID = 'eva-mileage-value-tool';
  const BADGE_CLASS = 'eva-mileage-value-badge';
  const STYLE_ID = 'eva-mileage-value-style';

  /* ---------- 網址限制 ---------- */

  const isAllowedPage =
    location.hostname === 'hotel.brmile.com' &&
    (
      location.pathname === '/search' ||
      location.pathname === '/details'
    );

  if (!isAllowedPage) {
    alert(
      'EVA Mileage Hotel 哩程價值工具\n\n' +
      '此工具僅支援：\n' +
      'https://hotel.brmile.com/search\n' +
      'https://hotel.brmile.com/details'
    );
    return;
  }

  /* ---------- 避免重複啟動 Observer ---------- */

  if (window[TOOL_ID] && window[TOOL_ID].observer) {
    try {
      window[TOOL_ID].observer.disconnect();
    } catch (e) {}
  }

  window[TOOL_ID] = {};

  /* ---------- CSS ---------- */

  document.getElementById(STYLE_ID)?.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;

  style.textContent = `
      .${BADGE_CLASS} {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-sizing: border-box !important;

        margin-right: 6px !important;
        padding: 4px 8px !important;
        min-height: 26px !important;

        border-radius: 9px !important;

        font-size: 14px !important;
        font-weight: 800 !important;
        line-height: 1 !important;
        letter-spacing: -0.2px !important;
        white-space: nowrap !important;

        vertical-align: middle !important;

        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          "Noto Sans TC",
          Arial,
          sans-serif !important;

        border: 1px solid rgba(0, 0, 0, 0.06) !important;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.16) !important;
        cursor: default !important;
        transition:
          transform 0.12s ease,
          box-shadow 0.12s ease !important;
      }

      .${BADGE_CLASS}:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 3px 7px rgba(0, 0, 0, 0.20) !important;
      }

      .${BADGE_CLASS}.eva-orange {
        background: #f5a623 !important;
        color: #ffffff !important;
      }

      .${BADGE_CLASS}.eva-blue {
        background: #67b7e8 !important;
        color: #ffffff !important;
      }

      .${BADGE_CLASS}.eva-green {
        background: #67c23a !important;
        color: #ffffff !important;
      }

      .eva-mileage-price-row {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        flex-wrap: wrap !important;
      }
    `;

  document.head.appendChild(style);

  /* ---------- 數字解析 ---------- */

  function parseNumber(text) {
    if (!text) return NaN;

    const cleaned = String(text)
      .replace(/,/g, '')
      .replace(/[^\d.]/g, '');

    const value = parseFloat(cleaned);

    return Number.isFinite(value) ? value : NaN;
  }

  /* ---------- 幣別判斷 ---------- */

  function detectCurrency(priceText) {
    const text = String(priceText || '').toUpperCase();

    if (
      text.includes('NT$') ||
      text.includes('TWD') ||
      text.includes('NTD')
    ) {
      return 'TWD';
    }

    if (
      text.includes('US$') ||
      text.includes('USD')
    ) {
      return 'USD';
    }

    return null;
  }

  /* ---------- 找哩程 ---------- */

  function getMiles(pricingContainer) {
    const earnBox = pricingContainer.querySelector(
      '[data-testid="earn-pricing-default"]'
    );

    if (!earnBox) return NaN;

    const spans = Array.from(
      earnBox.querySelectorAll('span')
    );

    /* 優先找「純數字」的 span */

    for (const span of spans) {
      const text = span.textContent.trim();

      if (/^[\d,]+$/.test(text)) {
        const value = parseNumber(text);

        if (Number.isFinite(value) && value > 0) {
          return value;
        }
      }
    }

    /* Fallback：從整個 earn 區域找第一個數字 */

    const text = earnBox.textContent || '';
    const match = text.match(/[\d,]+/);

    if (!match) return NaN;

    return parseNumber(match[0]);
  }

  /* ---------- 顏色 ---------- */

  function getTwdColor(value) {
    if (value > 6) {
      return 'eva-orange';
    }

    if (value >= 4) {
      return 'eva-blue';
    }

    return 'eva-green';
  }

  function getUsdColor(value) {
    if (value <= 5) {
      return 'eva-orange';
    }

    if (value <= 10) {
      return 'eva-blue';
    }

    return 'eva-green';
  }

  /* ---------- 建立 Badge ---------- */

  function createBadge(text, colorClass) {
    const badge = document.createElement('span');

    badge.className =
      BADGE_CLASS + ' ' + colorClass;

    badge.textContent = text;

    return badge;
  }

  /* ---------- 處理單一價格區 ---------- */

  function processPricing(pricingContainer) {
    if (!pricingContainer) return;

    const priceElement = pricingContainer.querySelector(
      '[data-testid="earn-price"]'
    );

    if (!priceElement) return;

    const priceText = priceElement.textContent.trim();

    if (!priceText) return;

    const currency = detectCurrency(priceText);

    if (!currency) return;

    const price = parseNumber(priceText);
    const miles = getMiles(pricingContainer);

    if (
      !Number.isFinite(price) ||
      !Number.isFinite(miles) ||
      price <= 0 ||
      miles <= 0
    ) {
      return;
    }

    let value;
    let badgeText;
    let colorClass;

    if (currency === 'TWD') {
      value = price / miles;

      badgeText =
        value.toFixed(2) + ' 元/哩';

      colorClass =
        getTwdColor(value);
    }

    if (currency === 'USD') {
      value = miles / price;

      badgeText =
        value.toFixed(2) + 'x';

      colorClass =
        getUsdColor(value);
    }

    if (!Number.isFinite(value)) return;

    const tooltip = currency === 'TWD'
      ? [
          `房價：NT$ ${price.toLocaleString()}`,
          `哩程：${miles.toLocaleString()}`,
          '',
          `${price.toLocaleString()} ÷ ${miles.toLocaleString()}`,
          `= ${value.toFixed(4)} 元/哩`
        ].join('\n')
      : [
          `房價：USD ${price.toLocaleString()}`,
          `哩程：${miles.toLocaleString()}`,
          '',
          `${miles.toLocaleString()} ÷ ${price.toLocaleString()}`,
          `= ${value.toFixed(4)}x`
        ].join('\n');

    /* ---------- 找既有 Badge ---------- */

    let badge = pricingContainer.querySelector(
      '.' + BADGE_CLASS
    );

    if (!badge) {
      badge = createBadge(
        badgeText,
        colorClass
      );
    } else {
      if (badge.textContent !== badgeText) {
        badge.textContent = badgeText;
      }

      badge.classList.remove(
        'eva-orange',
        'eva-blue',
        'eva-green'
      );

      badge.classList.add(colorClass);
    }

    badge.title = tooltip;

    /* ---------- 把 Badge 放到價格左邊 ---------- */

    let row = priceElement.parentElement;

    if (!row) return;

    row.classList.add(
      'eva-mileage-price-row'
    );

    if (badge.parentElement !== row) {
      row.insertBefore(
        badge,
        priceElement
      );
    } else if (
      badge.nextSibling !== priceElement
    ) {
      row.insertBefore(
        badge,
        priceElement
      );
    }
  }

  /* ---------- Search ---------- */

  function processSearchPage() {
    const containers = document.querySelectorAll(
      '[data-testid="hotel-card-pricing"]'
    );

    containers.forEach(
      processPricing
    );
  }

  /* ---------- Details ---------- */

  function processDetailsPage() {
    const containers = document.querySelectorAll(
      '[data-testid="room-card-pricing"]'
    );

    containers.forEach(
      processPricing
    );
  }

  /* ---------- 執行 ---------- */

  function run() {
    if (location.pathname === '/search') {
      processSearchPage();
    }

    if (location.pathname === '/details') {
      processDetailsPage();
    }
  }

  /* ---------- Debounce ---------- */

  let timer = null;

  function scheduleRun() {
    clearTimeout(timer);

    timer = setTimeout(
      run,
      300
    );
  }

  /* ---------- 初次執行 ---------- */

  run();

  /* ---------- React / SPA DOM 更新 ---------- */

  const observer = new MutationObserver(
    function () {
      scheduleRun();
    }
  );

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true,
      characterData: true
    }
  );

  window[TOOL_ID].observer = observer;
  window[TOOL_ID].run = run;

})();
