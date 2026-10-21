# 淺紫科技感 · Light Violet Tech

使用者於 2026-10-21 確認喜歡的 Bookmarklet Script Manager 介紹網站與 Market 風格。
這是本專案後續視覺設計的優先參考，不代表所有使用者專案的全域偏好。

## 後續使用

新增或調整本專案頁面時，先讀本文件與參考截圖。沿用配色、清楚的資訊層級及產品定位；依內容調整構圖，不必逐像素複製。新的明確使用者指示優先。

可以在後續需求中使用：

> 沿用 docs/brand-guidelines.md 的「淺紫科技感」：淺灰白底、白色面板、深紫文字、電光紫主要操作。保持插件介紹兼 Market 的定位，以真實用途展示多樣功能。

## 已確認的方向

- 主角是 Bookmarklet Script Manager 插件，以及能透過不同腳本替網站增加功能。
- 首頁介紹插件並提供安裝與探索 Market 的入口，不把哩程試算等單一用途當成整個產品。
- 以資訊計算、內容標示、自訂功能等情境，說明不同用途；現有案例和未來可自訂的能力要清楚區分。
- 桌面 Market 用雙欄卡片，手機單欄。前後截圖放在對應工具內，名稱、說明與操作保持同一組。
- 偏好淺底紫色的科技感，非先前黑底青色或暖黑金色版本。

## 色彩

| 角色 | 色碼 | 用途 |
| --- | --- | --- |
| background | #F5F5FA | 冷調灰白頁面底色 |
| surface | #FFFFFF | 卡片、功能展示面板 |
| surface-raised | #EEEBF6 | 淡紫資訊區、次要按鈕、選取底色 |
| text | #211B35 | 深紫標題與內文 |
| text-muted | #686477 | 次要資訊 |
| accent | #7047EB | 主要操作與選取文字 |
| on-accent | #FFFFFF | 紫色按鈕上的文字 |

大面積保持中性、低彩度；紫色集中在主要操作與互動狀態。避免整頁飽和紫、彩色卡片、霓虹光暈與裝飾性漸層。

使用者明確選擇紫色及雙欄 Market，優先於 design-taste-frontend 的預設禁紫／避免卡片列規則。檢查可對 palette-purple 使用明確例外，卡片排列須以市場內容的可比較性評估。

## 字體與層級

- 主字體：Stack Sans Text，400 內文、500 標題；繁體中文使用 PingFang TC、Microsoft JhengHei、sans-serif 備援。
- 字型檔及 OFL 授權：`../redesign/fonts/`。Stack Sans Headline 可保留於原有少量數字／次要展示，不是每個標題必須使用的字體。
- 桌面主標約 66px；平板 46px；手機 44px，標題最多兩行。
- 主要區塊標題約 36px，手機約 32px；工具名稱約 28px。
- 首屏說明 18px，一般內文 16–17px；次要資訊 13–14px。
- 標題略緊字距，內文正常字距、行高約 1.6。不要用等寬字體裝飾一般文字。

## 版面

- 左右外距一致：桌面 32px、平板 24px、手機 20px；大型螢幕限制內容寬度。
- 桌面首屏左側是產品說明與操作，右側是可切換的用途展示；較窄螢幕改為上下排列。
- 工具卡片間距約 24px，內距 24–28px。依內容保留自然高度，不用無意義的補白強制塞滿。
- 先讓人理解插件是什麼、能做什麼，再導向 Market。
- 教學與自訂腳本入口是輔助段落，不應壓過工具內容。
- 方角或非常克制的圓角，平面色階區分內容，不靠發光、陰影或玻璃效果。

## 元件與互動

- 「安裝擴充功能」為紫色主要按鈕，「探索 Market」為清楚的次要文字入口。
- 功能切換使用原生按鈕、明確選取狀態及 aria-pressed / aria-controls；未啟用 JavaScript 時保留可讀內容。
- 複製腳本連結要有成功回饋與手動複製備援，不建立假的安裝完成狀態。
- Hover / press / focus 要明確，鍵盤 focus 不可移除。
- 動態以短距離位移與透明度為主，遵循 prefers-reduced-motion；內容不得依賴動畫才可閱讀。

## 內容原則

使用具體用途、真實腳本、實際截圖及真實目的地。不要捏造支援功能、客戶、數字或插件畫面。自訂功能需說明實際效果依腳本與目標網站而定。

## 參考與檔案

- [桌面首屏](design/light-violet-tech/reference/desktop.jpg)
- [手機首屏](design/light-violet-tech/reference/mobile.jpg)
- [完整桌面排版聯絡表](design/light-violet-tech/reference/full-page.jpg)
- [可重用設計 token](design/light-violet-tech/tokens.json)
- [CSS 變數](design/light-violet-tech/tokens.css)
- 現行頁面：`../redesign/index.html`、`../redesign/style.css`、`../redesign/app.js`。

這些截圖是已確認版本的固定參考，不依賴會被後續檢查覆寫的 `.taste-skill/` 圖片。

## 共用分頁（2026-10-21）

插件 Logo 搭配 Bookmarklet Market 字標。主導覽順序固定為「介紹、工具集、安裝教學、製作腳本、轉換工具」，目前主分頁使用淡紫底與紫字及 `aria-current="page"`。共用外框位於 `assets/light-violet-shell.css`，內容樣式位於 `assets/light-violet.css`。現已支援英文、繁體中文、巴西葡萄牙文、西班牙文、日文、簡體中文、韓文、德文、法文；導覽須保留所選 lang 參數。最新分頁截圖及驗收紀錄見 `design/light-violet-tech/pages/README.md`。
