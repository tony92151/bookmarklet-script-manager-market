# Bookmarklet Script Manager Market

[English](README.md) · [繁體中文](README.zh-TW.md)

這個儲存庫放的是 **Bookmarklet Launcher Market** 網站：提供可匯入 Bookmarklet Script Manager，並在適用網頁上執行的 JavaScript 小工具。網站是純靜態網站，提供工具清單、腳本檔案與動畫安裝教學，不需要後端。Market 與教學支援英文、繁體中文、巴西葡萄牙文、西班牙文及日文。

另一個專案的 [Bookmarklet Script Manager 瀏覽器擴充功能](https://chromewebstore.google.com/detail/bookmarklet-script-manage/eodhedafaheiadegenafmjlkmifojemp)已在 Chrome 線上應用程式商店上架。這個儲存庫提供它的[隱私權政策](privacy.html)，但不包含擴充功能原始碼。

直接開啟網站：[GitHub Pages 上的 Bookmarklet Launcher](https://tony92151.github.io/bookmarklet-script-manager-market/)。

## 專案內容

| 路徑 | 用途 |
| --- | --- |
| [`index.html`](index.html) 與 [`assets/install.js`](assets/install.js) | 五語 Market，提供工具說明、預覽與用於匯入的 GitHub 連結。 |
| [`assets/locales/index.js`](assets/locales/index.js) 與 [`assets/language.js`](assets/language.js) | 語系註冊表、執行時載入的翻譯字典，以及共用語言偏好處理。 |
| [`install.html`](install.html) 與 [`install.en.html`](install.en.html) | 使用共用 JavaScript 與教學翻譯字典的安裝教學入口。 |
| [`bookmarklets/catalog.json`](bookmarklets/catalog.json) | 工具資訊、原始碼路徑與預期適用的網址格式。 |
| [`bookmarklets/`](bookmarklets/) | 各書籤工具的 JavaScript 原始碼。 |
| [`shared/bookmarklet.js`](shared/bookmarklet.js) | `javascript:` 書籤網址的編碼與解碼。 |
| [`converter/`](converter/) | 在瀏覽器中編碼、解碼書籤網址的工具。 |
| [`privacy.html`](privacy.html) | 另一個專案的瀏覽器擴充功能隱私權政策。 |

清單目前收錄三個工具：

- [Klook 訂單分類標籤](bookmarklets/klook-booking-category-label.js)：從分類圖示的檔名解析類別，在訂單標題旁加入標籤，也會處理之後動態載入的訂單。
- [華航 StayMiles 飯店哩程比值工具](bookmarklets/staymiles-rate-helper-zh.js)：在 StayMiles 飯店價格旁顯示台幣每哩成本或美元每元可得哩程。
- [長榮哩程飯店比值工具](bookmarklets/eva-mileage-hotel-healper-zh.js)：為長榮哩程飯店提供相同的價格與哩程比值資訊。

## 安裝與使用

完整步驟請見[安裝教學](install.html)。GitHub 匯入功能需要 Bookmarklet Script Manager **1.2.1 或更新版本**。

1. 安裝 Bookmarklet Script Manager 擴充功能。
2. 在 Market 檢視工具說明、適用網址及原始碼，再按「複製 GitHub 連結」。
3. 開啟擴充功能的「管理指令碼」，在「GitHub」分頁貼上連結並儲存。
4. 前往適用網站，從擴充功能選擇已儲存的工具執行。

腳本會在目前網頁執行，並可與頁面內容互動。匯入前請先檢視腳本。清單中的網址格式用來說明工具預期適用的頁面。

## 網站語言

可使用語言選單切換，或分享帶有語言參數的網址，例如 [`?lang=pt-BR`](https://tony92151.github.io/bookmarklet-script-manager-market/?lang=pt-BR)、[`?lang=es`](https://tony92151.github.io/bookmarklet-script-manager-market/?lang=es)、[`?lang=ja`](https://tony92151.github.io/bookmarklet-script-manager-market/?lang=ja)。教學也支援相同參數，例如 [`install.html?lang=ja`](install.html?lang=ja)。

語言選擇優先順序為：網址中受支援的 `lang` 值、已儲存的 `bookmarklet-launcher-language` 偏好、瀏覽器的 `navigator.languages`，最後預設為英文。舊教學檔名所對應的語言只在瀏覽器偏好之後、最終英文預設之前作為備援。網站語言偏好與擴充功能儲存的語言設定互相獨立。

Market 的翻譯字典位於 `assets/locales/`，由 `assets/locales/index.js` 註冊，並透過 `assets/language.js` 共用語言選擇邏輯。教學使用共用 JavaScript，以及 `assets/tutorial-locales.js` 中的獨立翻譯字典。工具名稱、說明與截圖替代文字則在 `bookmarklets/catalog.json` 翻譯。

網站翻譯不會自動翻譯工具本身的操作介面、截圖中的文字或擴充功能。隱私權政策與轉換器內文維持原有語言範圍。新增網站語言不代表 Chrome 線上應用程式商店已發布新版擴充功能或提供這些語言。

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
2. 在 [`catalog.json`](bookmarklets/catalog.json) 新增紀錄，填入唯一的 `id`、五種語系（`en`、`zh-TW`、`pt-BR`、`es`、`ja`）的 `name` 和 `description`、位於 `bookmarklets/` 的 `source`、預期適用網址 `matches`、`version` 和 `updated`。若提供預覽截圖，每張截圖的 `alt` 替代文字也須翻譯為這五種語系。
3. 執行測試，將工具匯入擴充功能，並在目標頁面實際執行以驗證結果。

清單頁提供每個原始碼檔案的 GitHub 連結，供擴充功能匯入。更多製作準則見 [`skill.md`](skill.md)。

## 部署

[GitHub Pages 工作流程](.github/workflows/deploy-pages.yml)會在推送至 `main` 或手動啟動時，執行測試並發布靜態網站。使用前須將此儲存庫的 Pages 來源設為 **GitHub Actions**。

## 授權

[MIT](LICENSE)
