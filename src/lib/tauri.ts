/**
 * Tauri API ラッパー
 */

export const invoke = window.__TAURI__.core.invoke;

export function getCurrentWindow() {
    return window.__TAURI__.window.getCurrentWindow();
}
