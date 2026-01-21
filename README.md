# Clip - タスク管理＆メモアプリ

📎 Discord風ダークテーマの軽量タスク管理＆メモアプリ

## 機能

- **コマンドパレット**: `Ctrl+Shift+Space` で素早く入力
- **メインウィンドウ**: `Ctrl+Shift+M` で表示切り替え
- **Markdown対応**: タスクもメモもMarkdownで記述・保存
- **ダークテーマ**: Discord風のモダンなUI
- **プラグインシステム**: 拡張可能なアーキテクチャ

## 設定ファイル

設定ファイル: `%LOCALAPPDATA%\Clip\config.json`

```json
{
  "theme": "dark",
  "accentColor": "#5865f2",
  "fontSize": 14,
  "editorFontFamily": "Consolas, Monaco, monospace",
  "editorLineHeight": 1.6,
  "spellCheck": false,
  "autocomplete": false,
  "autoSave": true,
  "autoSaveInterval": 5000,
  "syncInterval": 3000,
  "startMinimized": false,
  "alwaysOnTop": false,
  "dataPath": "",
  "shortcuts": {
    "palette": "Ctrl+Shift+Space",
    "mainWindow": "Ctrl+Shift+M"
  },
  "language": "ja"
}
```

### 設定項目

| 項目 | 説明 | デフォルト |
|------|------|-----------|
| `theme` | テーマ (`dark` / `light`) | `dark` |
| `accentColor` | アクセントカラー | `#5865f2` |
| `fontSize` | フォントサイズ (px) | `14` |
| `editorFontFamily` | エディタのフォント | `Consolas, Monaco, monospace` |
| `editorLineHeight` | エディタの行の高さ | `1.6` |
| `spellCheck` | スペルチェック | `false` |
| `autocomplete` | オートコンプリート | `false` |
| `autoSave` | 自動保存 | `true` |
| `autoSaveInterval` | 自動保存間隔 (ms) | `5000` |
| `syncInterval` | データ同期間隔 (ms) | `3000` |
| `startMinimized` | 最小化で起動 | `false` |
| `alwaysOnTop` | 常に最前面 | `false` |
| `dataPath` | データ保存場所（空=デフォルト） | `""` |
| `shortcuts.palette` | コマンドパレット | `Ctrl+Shift+Space` |
| `shortcuts.mainWindow` | メインウィンドウ | `Ctrl+Shift+M` |
| `language` | 言語 (`ja` / `en`) | `ja` |

> **Note**: `dataPath` を設定すると、タスク/メモをその場所に保存します。  
> 例: `"dataPath": "D:\\MyVault\\Clip"`

## データ保存場所

```
{dataPath または %LOCALAPPDATA%\Clip}/
├── config.json      # 設定ファイル
├── tasks/           # タスク（各.mdファイル）
└── notes/           # メモ（各.mdファイル）
```

## Markdownファイル形式

### タスク
```markdown
- [ ] タスクの内容

---
priority: medium
created: 1737504000
```

### メモ
```markdown
---
created: 1737504000
updated: 1737504000
---

# タイトル

メモの内容（Markdown）
```

## 開発

```powershell
# 開発サーバー
npm run tauri dev

# ビルド
npm run tauri build
```

## プラグイン

プラグイン開発については [PLUGIN_GUIDE.md](docs/PLUGIN_GUIDE.md) を参照してください。
