# Clip プラグイン開発ガイド（TypeScript）

Clipは型安全なTypeScriptプラグインシステムをサポートしています。

## クイックスタート

### 1. プラグインファイルを作成

```typescript
// src/plugins/my-plugin.ts
import type { ClipPlugin, PluginAPI, TaskAddData } from '../types/plugin';

const MyPlugin: ClipPlugin = {
  name: 'MyPlugin',
  version: '1.0.0',
  description: 'プラグインの説明',

  hooks: {
    onTaskAdd: async (data: TaskAddData, api: PluginAPI): Promise<TaskAddData> => {
      // @urgent を含む場合は高優先度に
      if (data.text.includes('@urgent')) {
        return { ...data, priority: 'high' };
      }
      return data;
    },
  },

  init(api: PluginAPI): void {
    console.log('プラグイン初期化');
    console.log(`現在のタスク数: ${api.getTasks().length}`);
  },
};

if (window.ClipPlugins) {
  window.ClipPlugins.register(MyPlugin);
}

export default MyPlugin;
```

## 型定義

すべての型は `src/types/plugin.ts` で定義されています。

### 主要な型

```typescript
// タスク
interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

// メモ
interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// プラグイン定義
interface ClipPlugin {
  name: string;
  version?: string;
  description?: string;
  hooks?: PluginHooks;
  init?(api: PluginAPI): void;
}
```

## 利用可能なフック

| フック名 | 型 | タイミング |
|----------|---|-----------|
| `onInit` | `Record<string, never>` | アプリ起動時 |
| `onTaskAdd` | `TaskAddData` | タスク追加前 |
| `onTaskComplete` | `TaskCompleteData` | タスク完了時 |
| `onTaskDelete` | `TaskDeleteData` | タスク削除前 |
| `onNoteAdd` | `NoteAddData` | メモ追加前 |
| `onNoteSave` | `NoteSaveData` | メモ保存前 |
| `onNoteDelete` | `NoteDeleteData` | メモ削除前 |
| `onRender` | `RenderData` | レンダリング後 |

## Plugin API

```typescript
interface PluginAPI {
  // 状態取得
  state(): AppState;
  getTasks(): Task[];
  getNotes(): Note[];

  // データ操作
  addTask(text: string, priority?: 'high' | 'medium' | 'low'): Promise<Task>;
  addNote(title: string, content?: string): Promise<Note>;

  // ユーティリティ
  parseMarkdown(text: string): string;
  escapeHtml(text: string): string;
  
  // 拡張
  registerCommand(name: string, handler: (args?: string) => void): void;
  showNotification(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void;
}
```

## サンプルプラグイン

### 自動タグ処理

```typescript
const AutoTagPlugin: ClipPlugin = {
  name: 'AutoTag',
  
  hooks: {
    onTaskAdd: async (data: TaskAddData): Promise<TaskAddData> => {
      if (data.text.includes('@today')) {
        // 今日のタスクとしてマーク
      }
      if (data.text.includes('@urgent')) {
        return { ...data, priority: 'high' };
      }
      return data;
    },
  },
};
```

## ファイル配置

```
Clip/
└── src/
    ├── types/
    │   └── plugin.ts       # 型定義
    └── plugins/
        ├── sample-plugin.ts # サンプル
        └── my-plugin.ts     # 自作プラグイン
```
