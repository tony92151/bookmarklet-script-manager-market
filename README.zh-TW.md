# Bookmarklet Script Manager Market

[English](README.md) · [繁體中文](README.zh-TW.md)

這個儲存庫放的是 **Bookmarklet Launcher** 網站：一個可將 JavaScript 小工具加入瀏覽器書籤列的清單。點擊已儲存的書籤，腳本就會在目前瀏覽的網頁執行。網站是純靜態網站，提供工具清單與腳本檔案，不需要後端或擴充功能。

另一個專案的 [Bookmarklet Script Manager 瀏覽器擴充功能](https://chromewebstore.google.com/detail/bookmarklet-script-manage/eodhedafaheiadegenafmjlkmifojemp)已在 Chrome 線上應用程式商店上架。這個儲存庫提供它的[隱私權政策](privacy.html)，但不包含擴充功能原始碼。

直接開啟網站：[GitHub Pages 上的 Bookmarklet Launcher](https://tony92151.github.io/bookmarklet-script-manager-market/)。

## 專案內容

| 路徑 | 用途 |
| --- | --- |
| [`index.html`](index.html) 與 [`assets/install.js`](assets/install.js) | 中英文工具清單頁，載入腳本並提供安裝與複製功能。 |
| [`install.html`](install.html) | 從 Chrome 線上應用程式商店安裝擴充功能，再從 Market 匯入 GitHub 工具的繁體中文教學。 |
| [`bookmarklets/catalog.json`](bookmarklets/catalog.json) | 工具資訊、原始碼路徑與預期適用的網址格式。 |
| [`bookmarklets/`](bookmarklets/) | 各書籤工具的 JavaScript 原始碼。 |
| [`shared/bookmarklet.js`](shared/bookmarklet.js) | `javascript:` 書籤網址的編碼與解碼。 |
| [`converter/`](converter/) | 在瀏覽器中編碼、解碼書籤網址的工具。 |
| [`privacy.html`](privacy.html) | 另一個專案的瀏覽器擴充功能隱私權政策。 |

清單目前收錄 [Klook 訂單分類標籤](bookmarklets/klook-booking-category-label.js)。在支援的 Klook 訂單頁面上，它會從分類圖示的檔名解析類別，在訂單標題旁加入標籤，也會處理之後動態載入的訂單。

## 安裝與使用

完整步驟請見[安裝教學](install.html)。擴充功能 1.2.1 版已於 Chrome 線上應用程式商店正式發佈。GitHub 匯入功能需要 1.2.1 或更新版本。

1. 安裝 Bookmarklet Script Manager 擴充功能。
2. 在 Market 工具卡片按「複製 GitHub 連結」。
3. 開啟擴充功能的「管理指令碼」，在「GitHub」分頁貼上連結並儲存。
4. 前往適用網站，從擴充功能選擇已儲存的工具執行。

書籤工具會在目前網頁執行，並可與頁面內容互動。安裝前請先檢視腳本。清單中的網址格式用來說明工具預期適用的頁面；它不會限制你能在哪些頁面點擊書籤。

## 本機執行

從儲存庫根目錄啟動 HTTP 伺服器：

```sh
python3 -m http.server 8000
```

開啟 <http://localhost:8000/>。首頁會載入 JSON 清單與 JavaScript 檔案，因此直接用 `file://` 開啟 `index.html` 無法正常使用。

使用 Node.js 執行測試：

```sh
node --experimental-default-type=module --test
```

## 新增書籤工具

1. 在 `bookmarklets/` 新增原始 JavaScript 檔案，不要加上 `javascript:` 前綴或預先編碼。建議用 IIFE 避免將變數放入頁面的全域範圍。
2. 在 [`catalog.json`](bookmarklets/catalog.json) 新增紀錄，填入唯一的 `id`、英文與繁體中文的 `name` 和 `description`、位於 `bookmarklets/` 的 `source`、預期適用網址 `matches`、`version` 和 `updated`。
3. 執行測試，並在目標頁面實際安裝、點擊書籤驗證結果。

清單頁提供每個原始碼檔案的 GitHub 連結，供擴充功能匯入。更多製作準則見 [`skill.md`](skill.md)。

## 部署

[GitHub Pages 工作流程](.github/workflows/deploy-pages.yml)會在推送至 `main` 或手動啟動時，執行測試並發布靜態網站。使用前須將此儲存庫的 Pages 來源設為 **GitHub Actions**。

## 授權

[MIT](LICENSE)
