//! ウィンドウ操作

use tauri::{AppHandle, Manager};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIcon, TrayIconBuilder};

/// パレットウィンドウをトグル
pub fn toggle_palette(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("palette") {
        if window.is_visible().unwrap_or(false) {
            window.hide().ok();
        } else {
            window.center().ok();
            window.show().ok();
            window.set_focus().ok();
        }
    }
}

/// メインウィンドウをトグル
pub fn toggle_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            window.hide().ok();
        } else {
            window.show().ok();
            window.set_always_on_top(true).ok();
            window.set_focus().ok();
        }
    }
}

/// パレットを隠す
pub fn hide_palette(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("palette") {
        window.hide().ok();
    }
}

/// メインウィンドウを表示
pub fn show_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        window.show().ok();
        window.set_focus().ok();
    }
}

/// システムトレイをセットアップ
pub fn setup_tray(app: &AppHandle) -> Result<TrayIcon, tauri::Error> {
    let show_item = MenuItem::with_id(app, "show", "メインウィンドウを開く", true, None::<&str>)?;
    let palette_item = MenuItem::with_id(app, "palette", "クイック入力 (Ctrl+Shift+Space)", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "終了", true, None::<&str>)?;
    
    let menu = Menu::with_items(app, &[&show_item, &palette_item, &quit_item])?;
    
    let tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .tooltip("Clip - タスク & メモ")
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
                "show" => show_main(app),
                "palette" => toggle_palette(app),
                "quit" => app.exit(0),
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click { button: tauri::tray::MouseButton::Left, .. } = event {
                show_main(tray.app_handle());
            }
        })
        .build(app)?;
    
    Ok(tray)
}
