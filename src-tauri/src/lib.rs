//! Clip - Tauri バックエンド

mod models;
mod storage;
mod commands;
mod windows;
mod utils;

use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub use models::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // グローバルショートカット
    let shortcut_palette = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);
    let shortcut_main = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyM);
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        match shortcut.key {
                            Code::Space => windows::toggle_palette(app),
                            Code::KeyM => windows::toggle_main(app),
                            _ => {}
                        }
                    }
                })
                .build()
        )
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_data,
            commands::add_task,
            commands::update_task,
            commands::delete_task,
            commands::add_note,
            commands::update_note,
            commands::delete_note,
            commands::hide_palette,
            commands::show_main,
            commands::get_config,
            commands::save_config
        ])
        .setup(move |app| {
            // システムトレイ
            windows::setup_tray(app.handle())?;
            
            // ショートカット登録
            app.global_shortcut().register(shortcut_palette)?;
            app.global_shortcut().register(shortcut_main)?;
            
            // メインウィンドウ表示
            if let Some(main_window) = app.get_webview_window("main") {
                main_window.show().ok();
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
