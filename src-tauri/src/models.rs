//! データモデル定義

use serde::{Deserialize, Serialize};

/// タスク
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub text: String,
    pub completed: bool,
    pub priority: String,
    pub created_at: String,
}

/// メモ
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

/// アプリケーションデータ
#[derive(Debug, Serialize, Deserialize, Default)]
pub struct AppData {
    pub tasks: Vec<Task>,
    pub notes: Vec<Note>,
}
