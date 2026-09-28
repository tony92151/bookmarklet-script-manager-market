(() => {
  'use strict';

  // ============================================================
  // StayMiles Rate Helper
  //
  // Search Page + Hotel Detail Page
  //
  // TWD:
  //   房價 ÷ 哩程 = 元/哩
  //
  // USD:
  //   哩程 ÷ 房價 = x
  // ============================================================

  const APP_ID = 'staymiles-rate-helper';
  const STYLE_ID = `${APP_ID}-style`;
  const WRAPPER_CLASS = `${APP_ID}-wrapper`;
  const BADGE_CLASS = `${APP_ID}-badge`;

  // ============================================================
  // URL 限制
  // ============================================================

  const ALLOWED_HOST =
    'www.staymiles.china-airlines.com';

  const path =
    location.pathname;

  const isSearchPage =
    path === '/search';

  const isHotelPage =
    /\/hotel(?:\/|$)/i.test(path);

  if (
    location.hostname !== ALLOWED_HOST ||
    (!isSearchPage && !isHotelPage)
  ) {
    alert(
      'StayMiles Rate Helper\n\n' +
      '此書籤僅適用於華航 StayMiles：\n' +
      '• 飯店搜尋結果頁\n' +
      '• 飯店詳細／房型頁'
    );

    return;
  }

  // ============================================================
  // 設定
  // ============================================================

  const CONFIG = {
    TWD: {
      // <= 4 元/哩 → 綠
      greenMax: 4,

      // >4 ~ <=6 → 藍
      // >6 → 橘
      blueMax: 6
    },

    USD: {
      // <=5x → 橘
      orangeMax: 5,

      // >5 ~ <=10 → 藍
      // >10 → 綠
      blueMax: 10
    },

    decimals: 2,

    debug: false
  };

  const log = (...args) => {
    if (CONFIG.debug) {
      console.log(
        '[StayMiles Rate]',
        ...args
      );
    }
  };

  // ============================================================
  // CSS
  // ============================================================

  function installStyle() {
    document
      .getElementById(STYLE_ID)
      ?.remove();

    const style =
      document.createElement('style');

    style.id = STYLE_ID;

    style.textContent = `
      .${WRAPPER_CLASS} {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        margin-right: 6px;

        flex-shrink: 0;

        vertical-align: middle;
      }

      .${BADGE_CLASS} {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        padding: 4px 8px;

        min-height: 26px;

        border-radius: 9px;

        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Arial,
          sans-serif;

        font-size: 14px;
        font-weight: 800;
        line-height: 1;

        letter-spacing: -0.2px;

        white-space: nowrap;

        box-sizing: border-box;

        border:
          1px solid
          rgba(0, 0, 0, 0.06);

        box-shadow:
          0 2px 5px
          rgba(0, 0, 0, 0.16);

        cursor: default;

        transition:
          transform 0.12s ease,
          box-shadow 0.12s ease;
      }

      .${BADGE_CLASS}:hover {
        transform: translateY(-1px);

        box-shadow:
          0 3px 7px
          rgba(0, 0, 0, 0.20);
      }

      .${BADGE_CLASS}[data-level="green"] {
        background: #67c23a;
        color: #ffffff;
      }

      .${BADGE_CLASS}[data-level="blue"] {
        background: #67b7e8;
        color: #ffffff;
      }

      .${BADGE_CLASS}[data-level="orange"] {
        background: #f5a623;
        color: #ffffff;
      }
    `;

    document.head.appendChild(
      style
    );
  }

  // ============================================================
  // 數字解析
  // ============================================================

  function parseNumber(value) {
    if (value == null) {
      return null;
    }

    const cleaned =
      String(value)
        .replace(/,/g, '')
        .replace(/[^\d.]/g, '');

    if (!cleaned) {
      return null;
    }

    const number =
      Number(cleaned);

    return Number.isFinite(number)
      ? number
      : null;
  }

  // ============================================================
  // 抓哩程
  // ============================================================

  function extractMiles(container) {
    const candidates = [
      ...container.querySelectorAll(
        '[data-testid="upc_caption"]'
      )
    ];

    for (
      const element
      of candidates
    ) {
      // 排除價格
      if (
        element.matches(
          '[data-element-name="fpc-room-price"]'
        )
      ) {
        continue;
      }

      const text =
        element.textContent
          ?.trim() || '';

      // 中文
      //
      // 賺取800哩程回饋
      // 賺取1,300哩程回饋

      const zhMatch =
        text.match(
          /賺取\s*([\d,]+)\s*(?:哩程|哩)/i
        );

      if (zhMatch) {
        const miles =
          parseNumber(
            zhMatch[1]
          );

        if (miles) {
          return {
            miles,
            element,
            text
          };
        }
      }

      // 英文
      //
      // Earn 800 Miles
      // Earn at least 1,893 Miles

      const enMatch =
        text.match(
          /earn(?:\s+at\s+least)?\s*([\d,]+)\s*(?:miles?|points?)/i
        );

      if (enMatch) {
        const miles =
          parseNumber(
            enMatch[1]
          );

        if (miles) {
          return {
            miles,
            element,
            text
          };
        }
      }
    }

    return null;
  }

  // ============================================================
  // 抓價格
  // ============================================================

  function extractPrice(container) {
    const element =
      container.querySelector(
        '[data-element-name="fpc-room-price"]'
      ) ||
      container.querySelector(
        '[data-testid="upc_caption"][data-fpc-value]'
      );

    if (!element) {
      return null;
    }

    const text =
      element.textContent
        ?.trim() || '';

    const rawValue =
      element.getAttribute(
        'data-fpc-value'
      );

    let price =
      parseNumber(rawValue);

    if (price == null) {
      price =
        parseNumber(text);
    }

    if (price == null) {
      return null;
    }

    return {
      price,
      text,
      element
    };
  }

  // ============================================================
  // 幣別
  // ============================================================

  function detectCurrency(
    priceInfo
  ) {
    const text =
      priceInfo.text || '';

    if (
      /NT\$|NTD|TWD|新台幣|台幣/i
        .test(text)
    ) {
      return 'TWD';
    }

    if (
      /US\$|USD/i
        .test(text)
    ) {
      return 'USD';
    }

    // 英文頁如果只顯示 $139
    if (
      /^\s*\$/
        .test(text)
    ) {
      return 'USD';
    }

    return null;
  }

  // ============================================================
  // 計算
  // ============================================================

  function calculateRate(
    price,
    miles,
    currency
  ) {
    if (
      !Number.isFinite(price) ||
      !Number.isFinite(miles) ||
      price <= 0 ||
      miles <= 0
    ) {
      return null;
    }

    // ==========================================================
    // TWD
    // ==========================================================

    if (
      currency === 'TWD'
    ) {
      const value =
        price / miles;

      let level;

      if (
        value <=
        CONFIG.TWD.greenMax
      ) {
        level = 'green';

      } else if (
        value <=
        CONFIG.TWD.blueMax
      ) {
        level = 'blue';

      } else {
        level = 'orange';
      }

      return {
        value,
        level,

        text:
          `${value.toFixed(
            CONFIG.decimals
          )}元/哩`
      };
    }

    // ==========================================================
    // USD
    // ==========================================================

    if (
      currency === 'USD'
    ) {
      const value =
        miles / price;

      let level;

      if (
        value >
        CONFIG.USD.blueMax
      ) {
        level = 'green';

      } else if (
        value >
        CONFIG.USD.orangeMax
      ) {
        level = 'blue';

      } else {
        level = 'orange';
      }

      return {
        value,
        level,

        text:
          `${value.toFixed(
            CONFIG.decimals
          )}x`
      };
    }

    return null;
  }

  // ============================================================
  // Badge
  // ============================================================

  function createBadge() {
    const wrapper =
      document.createElement(
        'span'
      );

    wrapper.className =
      WRAPPER_CLASS;

    const badge =
      document.createElement(
        'span'
      );

    badge.className =
      BADGE_CLASS;

    wrapper.appendChild(
      badge
    );

    return {
      wrapper,
      badge
    };
  }

  // ============================================================
  // Render
  // ============================================================

  function renderBadge(
    container,
    milesInfo,
    priceInfo,
    currency,
    rate
  ) {
    let wrapper =
      container.querySelector(
        `.${WRAPPER_CLASS}`
      );

    let badge;

    if (!wrapper) {
      const created =
        createBadge();

      wrapper =
        created.wrapper;

      badge =
        created.badge;

    } else {
      badge =
        wrapper.querySelector(
          `.${BADGE_CLASS}`
        );
    }

    if (!badge) {
      return;
    }

    // ==========================================================
    // 找價格 Row
    // ==========================================================

    const priceRow =
      priceInfo.element.closest(
        '[data-testid="row-item-0"]'
      );

    if (priceRow) {
      /*
       * 最終：
       *
       * [3.90元/哩]   NT$ 5,066
       */

      priceRow.insertBefore(
        wrapper,
        priceInfo.element
      );

      priceRow.style.display =
        'flex';

      priceRow.style.alignItems =
        'center';

      priceRow.style.justifyContent =
        'flex-end';

      priceRow.style.gap =
        '8px';

      priceRow.style.flexWrap =
        'nowrap';

    } else {
      /*
       * DOM 改版 fallback
       */

      priceInfo.element
        .insertAdjacentElement(
          'beforebegin',
          wrapper
        );
    }

    // ==========================================================
    // Badge 資料
    // ==========================================================

    badge.textContent =
      rate.text;

    badge.dataset.level =
      rate.level;

    badge.dataset.price =
      String(
        priceInfo.price
      );

    badge.dataset.miles =
      String(
        milesInfo.miles
      );

    badge.dataset.currency =
      currency;

    // ==========================================================
    // Tooltip
    // ==========================================================

    if (
      currency === 'TWD'
    ) {
      badge.title = [
        `房價：NT$ ${priceInfo.price.toLocaleString()}`,
        `哩程：${milesInfo.miles.toLocaleString()}`,
        '',
        `${priceInfo.price.toLocaleString()} ÷ ${milesInfo.miles.toLocaleString()}`,
        `= ${rate.value.toFixed(4)} 元/哩`
      ].join('\n');

    } else {
      badge.title = [
        `房價：USD ${priceInfo.price.toLocaleString()}`,
        `哩程：${milesInfo.miles.toLocaleString()}`,
        '',
        `${milesInfo.miles.toLocaleString()} ÷ ${priceInfo.price.toLocaleString()}`,
        `= ${rate.value.toFixed(4)}x`
      ].join('\n');
    }
  }

  // ============================================================
  // 處理單一 Container
  // ============================================================

  function processContainer(
    container
  ) {
    try {
      const milesInfo =
        extractMiles(
          container
        );

      if (
        !milesInfo?.miles
      ) {
        return;
      }

      const priceInfo =
        extractPrice(
          container
        );

      if (
        !priceInfo?.price
      ) {
        return;
      }

      const currency =
        detectCurrency(
          priceInfo
        );

      if (!currency) {
        return;
      }

      const rate =
        calculateRate(
          priceInfo.price,
          milesInfo.miles,
          currency
        );

      if (!rate) {
        return;
      }

      const existingBadge =
        container.querySelector(
          `.${BADGE_CLASS}`
        );

      /*
       * 資料沒變就不需要重畫。
       */

      if (
        existingBadge &&
        existingBadge.dataset.price ===
          String(priceInfo.price) &&
        existingBadge.dataset.miles ===
          String(milesInfo.miles) &&
        existingBadge.dataset.currency ===
          currency
      ) {
        return;
      }

      renderBadge(
        container,
        milesInfo,
        priceInfo,
        currency,
        rate
      );

      log({
        page:
          isSearchPage
            ? 'search'
            : 'hotel',

        price:
          priceInfo.price,

        miles:
          milesInfo.miles,

        currency,

        result:
          rate.text
      });

    } catch (error) {
      console.error(
        '[StayMiles Rate]',
        error,
        container
      );
    }
  }

  // ============================================================
  // 搜尋結果頁
  // ============================================================

  function scanSearchPage() {
    const hotels =
      document.querySelectorAll(
        'li[data-selenium="hotel-item"]'
      );

    hotels.forEach(
      processContainer
    );

    log(
      `搜尋頁：${hotels.length} 間飯店`
    );
  }

  // ============================================================
  // 飯店詳細頁
  // ============================================================

  function scanHotelPage() {
    /*
     * 每一個 child-room-item
     * 都是一個獨立價格方案。
     *
     * 因此：
     *
     * 1,300 miles + NT$5,066
     *
     * 不會誤配到：
     *
     * 1,400 miles + NT$5,404
     */

    const offers =
      document.querySelectorAll(
        '[data-element-name="child-room-item"]'
      );

    offers.forEach(
      processContainer
    );

    log(
      `詳細頁：${offers.length} 個房價方案`
    );
  }

  // ============================================================
  // Scan
  // ============================================================

  function scan() {
    if (isSearchPage) {
      scanSearchPage();
      return;
    }

    if (isHotelPage) {
      scanHotelPage();
    }
  }

  // ============================================================
  // MutationObserver
  // ============================================================

  let scanTimer = null;

  function scheduleScan() {
    clearTimeout(
      scanTimer
    );

    scanTimer =
      setTimeout(
        scan,
        300
      );
  }

  // ============================================================
  // 關閉舊 Observer
  // ============================================================

  if (
    window
      .__stayMilesRateObserver
  ) {
    window
      .__stayMilesRateObserver
      .disconnect();
  }

  // ============================================================
  // 建立 Observer
  // ============================================================

  const observer =
    new MutationObserver(
      scheduleScan
    );

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true,
      characterData: true
    }
  );

  window
    .__stayMilesRateObserver =
    observer;

  // ============================================================
  // 啟動
  // ============================================================

  installStyle();

  scan();

  console.log(
    '%c StayMiles Rate Helper ',
    [
      'background:#285fa5',
      'color:#ffffff',
      'font-weight:700',
      'padding:5px 9px',
      'border-radius:5px'
    ].join(';'),

    isSearchPage
      ? '搜尋結果頁已啟動'
      : '飯店詳細頁已啟動'
  );

})();
