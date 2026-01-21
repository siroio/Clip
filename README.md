# Clip - タスク管理＆メモアプリ

📎 Discord風ダークテーマの軽量タスク管理＆メモアプリ

## 機能

- **コマンドパレット**: `Ctrl+Shift+Space` で素早く入力
  - そのまま入力 → タスク追加
  - `m:` で始める → メモ追加
- **Markdown対応**: タスクもメモもMarkdownで記述・保存
- **ダークテーマ**: Discord風のモダンなUI
- **システムトレイ常駐**: バックグラウンドで動作

## データ保存場所（Markdownファイル）

```
%LOCALAPPDATA%\Clip\
├── tasks\           # タスク（各.mdファイル）
│   ├── xxx.md
│   └── ...
└── notes\           # メモ（各.mdファイル）
    ├── xxx.md
    └── ...
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

## 開発コマンド

```powershell
# 開発サーバー
npm run tauri dev

# ビルド
npm run tauri build
```

## ファイル構成

```
Clip/
├── src/                    # フロントエンド
│   ├── index.html
│   ├── palette.html        # コマンドパレット
│   ├── styles.css
│   └── main.js
└── src-tauri/              # バックエンド (Rust)
    ├── src/lib.rs
    └── tauri.conf.json
```
