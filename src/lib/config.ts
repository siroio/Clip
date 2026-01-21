/**
 * Clip 設定システム
 */

import { invoke } from './tauri';

export interface ClipConfig {
    // 外観
    theme: 'dark' | 'light';
    accentColor: string;
    fontSize: number;

    // エディタ
    editorFontFamily: string;
    editorLineHeight: number;
    spellCheck: boolean;
    autocomplete: boolean;

    // 動作
    autoSave: boolean;
    autoSaveInterval: number;
    syncInterval: number;
    startMinimized: boolean;
    alwaysOnTop: boolean;

    // データ保存
    dataPath: string;  // 空文字列の場合はデフォルト（%LOCALAPPDATA%/Clip）

    // ショートカット（Rust側で適用）
    shortcuts: {
        palette: string;
        mainWindow: string;
    };

    // その他
    language: 'ja' | 'en';
}

export const defaultConfig: ClipConfig = {
    theme: 'dark',
    accentColor: '#5865f2',
    fontSize: 14,
    editorFontFamily: 'Consolas, Monaco, monospace',
    editorLineHeight: 1.6,
    spellCheck: false,
    autocomplete: false,
    autoSave: true,
    autoSaveInterval: 5000,
    syncInterval: 3000,
    startMinimized: false,
    alwaysOnTop: false,
    dataPath: '',
    shortcuts: {
        palette: 'Ctrl+Shift+Space',
        mainWindow: 'Ctrl+Shift+M',
    },
    language: 'ja',
};

let config: ClipConfig = { ...defaultConfig };

export async function loadConfig(): Promise<void> {
    try {
        const saved = await invoke<string | null>('get_config');
        if (saved) {
            config = { ...defaultConfig, ...JSON.parse(saved) };
        }
    } catch {
        console.log('[Clip] Using default config');
    }
    applyConfig();
}

export async function saveConfig(): Promise<void> {
    try {
        await invoke('save_config', { config: JSON.stringify(config) });
    } catch (err) {
        console.error('設定保存エラー:', err);
    }
}

function applyConfig(): void {
    const root = document.documentElement;
    root.style.setProperty('--accent-primary', config.accentColor);
    root.style.setProperty('--font-size-base', `${config.fontSize}px`);
    root.style.setProperty('--editor-font-family', config.editorFontFamily);
    root.style.setProperty('--editor-line-height', `${config.editorLineHeight}`);
}

export function getConfig(): ClipConfig {
    return { ...config };
}

export function setConfig(updates: Partial<ClipConfig>): void {
    config = { ...config, ...updates };
    applyConfig();
    saveConfig();
}
