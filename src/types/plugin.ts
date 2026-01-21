/**
 * Clip プラグインシステム 型定義
 * 
 * この型定義を使って型安全なプラグインを作成できます。
 */

// ===========================================
// データ型
// ===========================================

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
    created_at: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface AppState {
    currentView: 'tasks' | 'notes';
    tasks: Task[];
    notes: Note[];
    currentNoteId: string | null;
    taskFilter: 'all' | 'active' | 'completed';
    noteEditorTab: 'edit' | 'preview';
    isEditing: boolean;
    lastEditTime: number;
}

// ===========================================
// フックデータ型
// ===========================================

export interface TaskAddData {
    text: string;
    priority: 'high' | 'medium' | 'low';
}

export interface TaskCompleteData {
    task: Task;
}

export interface TaskDeleteData {
    id: string;
}

export interface NoteAddData {
    title: string;
    content: string;
}

export interface NoteSaveData {
    id: string;
    title: string;
    content: string;
}

export interface NoteDeleteData {
    id: string;
}

export interface RenderData {
    state: AppState;
}

// ===========================================
// フックハンドラ型
// ===========================================

export type HookHandler<T> = (data: T, api: PluginAPI) => T | Promise<T> | void | Promise<void>;

export interface PluginHooks {
    onInit?: HookHandler<Record<string, never>>;
    onTaskAdd?: HookHandler<TaskAddData>;
    onTaskComplete?: HookHandler<TaskCompleteData>;
    onTaskDelete?: HookHandler<TaskDeleteData>;
    onNoteAdd?: HookHandler<NoteAddData>;
    onNoteSave?: HookHandler<NoteSaveData>;
    onNoteDelete?: HookHandler<NoteDeleteData>;
    onRender?: HookHandler<RenderData>;
}

// ===========================================
// プラグインAPI
// ===========================================

export interface PluginAPI {
    /** 現在のアプリ状態を取得 */
    state(): AppState;

    /** 全タスクを取得 */
    getTasks(): Task[];

    /** 全メモを取得 */
    getNotes(): Note[];

    /** タスクを追加 */
    addTask(text: string, priority?: 'high' | 'medium' | 'low'): Promise<Task>;

    /** メモを追加 */
    addNote(title: string, content?: string): Promise<Note>;

    /** 通知を表示 */
    showNotification(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void;

    /** カスタムコマンドを登録 */
    registerCommand(name: string, handler: (args?: string) => void): void;

    /** 設定を取得 */
    getConfig(): Record<string, unknown>;

    /** 設定を更新 */
    setConfig(updates: Record<string, unknown>): void;

    /** Markdownをパース */
    parseMarkdown(text: string): string;

    /** HTMLエスケープ */
    escapeHtml(text: string): string;
}

// ===========================================
// プラグイン定義
// ===========================================

export interface ClipPlugin {
    /** プラグイン名（必須） */
    name: string;

    /** バージョン */
    version?: string;

    /** 説明 */
    description?: string;

    /** フック */
    hooks?: PluginHooks;

    /** 初期化関数 */
    init?(api: PluginAPI): void | Promise<void>;

    /** 終了関数 */
    destroy?(): void | Promise<void>;
}

// ===========================================
// プラグインマネージャー
// ===========================================

export interface ClipPluginsManager {
    /** プラグインを登録 */
    register(plugin: ClipPlugin): boolean;

    /** フックをトリガー */
    trigger<T>(hookName: keyof PluginHooks, data: T): Promise<T>;

    /** APIを取得 */
    getAPI(): PluginAPI;

    /** 登録済みプラグインを取得 */
    getPlugins(): ClipPlugin[];
}

// グローバル型拡張
declare global {
    interface Window {
        ClipPlugins: ClipPluginsManager;
        ClipCommands: Record<string, (args?: string) => void>;
        __TAURI__: {
            core: {
                invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
            };
            window: {
                getCurrentWindow(): {
                    setAlwaysOnTop(value: boolean): Promise<void>;
                    show(): Promise<void>;
                    hide(): Promise<void>;
                };
            };
        };
    }
}

export { };
