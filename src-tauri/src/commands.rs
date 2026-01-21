//! Tauriコマンド

use tauri::AppHandle;
use crate::models::{Task, Note, AppData};
use crate::storage;
use crate::utils;

/// データを取得
#[tauri::command]
pub fn get_data() -> AppData {
    AppData {
        tasks: storage::load_tasks(),
        notes: storage::load_notes(),
    }
}

/// タスクを追加
#[tauri::command]
pub fn add_task(text: String, priority: String) -> Result<Task, String> {
    let task = Task {
        id: utils::uuid_simple(),
        text,
        completed: false,
        priority,
        created_at: utils::timestamp_now(),
    };
    storage::save_task(&task)?;
    Ok(task)
}

/// タスクを更新
#[tauri::command]
pub fn update_task(id: String, text: Option<String>, completed: Option<bool>, priority: Option<String>) -> Result<(), String> {
    let tasks = storage::load_tasks();
    if let Some(mut task) = tasks.into_iter().find(|t| t.id == id) {
        if let Some(t) = text { task.text = t; }
        if let Some(c) = completed { task.completed = c; }
        if let Some(p) = priority { task.priority = p; }
        storage::save_task(&task)?;
    }
    Ok(())
}

/// タスクを削除
#[tauri::command]
pub fn delete_task(id: String) -> Result<(), String> {
    storage::remove_task_file(&id)
}

/// メモを追加
#[tauri::command]
pub fn add_note(title: String, content: String) -> Result<Note, String> {
    let now = utils::timestamp_now();
    let note = Note {
        id: utils::uuid_simple(),
        title,
        content,
        created_at: now.clone(),
        updated_at: now,
    };
    storage::save_note(&note)?;
    Ok(note)
}

/// メモを更新
#[tauri::command]
pub fn update_note(id: String, title: Option<String>, content: Option<String>) -> Result<(), String> {
    let notes = storage::load_notes();
    if let Some(mut note) = notes.into_iter().find(|n| n.id == id) {
        if let Some(t) = title { note.title = t; }
        if let Some(c) = content { note.content = c; }
        note.updated_at = utils::timestamp_now();
        storage::save_note(&note)?;
    }
    Ok(())
}

/// メモを削除
#[tauri::command]
pub fn delete_note(id: String) -> Result<(), String> {
    storage::remove_note_file(&id)
}

/// 設定を取得
#[tauri::command]
pub fn get_config() -> Option<String> {
    storage::load_config()
}

/// 設定を保存
#[tauri::command]
pub fn save_config(config: String) -> Result<(), String> {
    storage::save_config(&config)
}

/// パレットを隠す
#[tauri::command]
pub fn hide_palette(app: AppHandle) {
    crate::windows::hide_palette(&app);
}

/// メインウィンドウを表示
#[tauri::command]
pub fn show_main(app: AppHandle) {
    crate::windows::show_main(&app);
}
