//! ストレージ（ファイル操作）

use std::fs;
use std::path::PathBuf;
use crate::models::{Task, Note};

// ===========================================
// ディレクトリ
// ===========================================

/// データディレクトリを取得
pub fn get_data_dir() -> PathBuf {
    let mut path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("Clip");
    fs::create_dir_all(&path).ok();
    path
}

/// タスクディレクトリを取得
pub fn get_tasks_dir() -> PathBuf {
    let mut path = get_data_dir();
    path.push("tasks");
    fs::create_dir_all(&path).ok();
    path
}

/// ノートディレクトリを取得
pub fn get_notes_dir() -> PathBuf {
    let mut path = get_data_dir();
    path.push("notes");
    fs::create_dir_all(&path).ok();
    path
}

/// 設定ファイルパスを取得
pub fn get_config_path() -> PathBuf {
    let mut path = get_data_dir();
    path.push("config.json");
    path
}

// ===========================================
// タスク
// ===========================================

/// Markdownからタスクをパース
pub fn parse_task_from_md(id: &str, content: &str) -> Option<Task> {
    let lines: Vec<&str> = content.lines().collect();
    if lines.is_empty() {
        return None;
    }
    
    let mut completed = false;
    let mut text = String::new();
    let mut priority = "medium".to_string();
    let mut created_at = String::new();
    
    for line in &lines {
        if line.starts_with("- [x]") || line.starts_with("- [X]") {
            completed = true;
            text = line[5..].trim().to_string();
        } else if line.starts_with("- [ ]") {
            completed = false;
            text = line[5..].trim().to_string();
        } else if line.starts_with("priority:") {
            priority = line[9..].trim().to_string();
        } else if line.starts_with("created:") {
            created_at = line[8..].trim().to_string();
        }
    }
    
    if text.is_empty() && !lines.is_empty() {
        text = lines[0].to_string();
    }
    
    Some(Task { id: id.to_string(), text, completed, priority, created_at })
}

/// タスクをMarkdown形式に変換
pub fn task_to_md(task: &Task) -> String {
    let checkbox = if task.completed { "- [x]" } else { "- [ ]" };
    format!(
        "{} {}\n\n---\npriority: {}\ncreated: {}\n",
        checkbox, task.text, task.priority, task.created_at
    )
}

/// 全タスクを読み込み
pub fn load_tasks() -> Vec<Task> {
    let dir = get_tasks_dir();
    let mut tasks = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |e| e == "md") {
                if let Ok(content) = fs::read_to_string(&path) {
                    let id = path.file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or("")
                        .to_string();
                    if let Some(task) = parse_task_from_md(&id, &content) {
                        tasks.push(task);
                    }
                }
            }
        }
    }
    tasks
}

/// タスクを保存
pub fn save_task(task: &Task) -> Result<(), String> {
    let path = get_tasks_dir().join(format!("{}.md", task.id));
    fs::write(path, task_to_md(task)).map_err(|e| e.to_string())
}

/// タスクを削除
pub fn remove_task_file(id: &str) -> Result<(), String> {
    let path = get_tasks_dir().join(format!("{}.md", id));
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())
    } else {
        Ok(())
    }
}

// ===========================================
// ノート
// ===========================================

/// Markdownからノートをパース
pub fn parse_note_from_md(id: &str, content: &str) -> Note {
    let lines: Vec<&str> = content.lines().collect();
    let mut title = String::new();
    let mut note_content = String::new();
    let mut created_at = String::new();
    let mut updated_at = String::new();
    let mut in_frontmatter = false;
    let mut frontmatter_count = 0;
    let mut content_start = 0;
    
    for (i, line) in lines.iter().enumerate() {
        if *line == "---" {
            frontmatter_count += 1;
            if frontmatter_count == 1 {
                in_frontmatter = true;
            } else if frontmatter_count == 2 {
                in_frontmatter = false;
                content_start = i + 1;
            }
        } else if in_frontmatter {
            if line.starts_with("created:") {
                created_at = line[8..].trim().to_string();
            } else if line.starts_with("updated:") {
                updated_at = line[8..].trim().to_string();
            }
        } else if !in_frontmatter && frontmatter_count >= 2 {
            if title.is_empty() && line.starts_with("# ") {
                title = line[2..].trim().to_string();
            }
        }
    }
    
    if content_start < lines.len() {
        note_content = lines[content_start..].join("\n").trim().to_string();
        if note_content.starts_with("# ") {
            if let Some(idx) = note_content.find('\n') {
                note_content = note_content[idx..].trim().to_string();
            } else {
                note_content = String::new();
            }
        }
    }
    
    if frontmatter_count == 0 {
        if !lines.is_empty() && lines[0].starts_with("# ") {
            title = lines[0][2..].trim().to_string();
            note_content = lines[1..].join("\n").trim().to_string();
        } else {
            note_content = content.to_string();
        }
    }
    
    Note { id: id.to_string(), title, content: note_content, created_at, updated_at }
}

/// ノートをMarkdown形式に変換
pub fn note_to_md(note: &Note) -> String {
    format!(
        "---\ncreated: {}\nupdated: {}\n---\n\n# {}\n\n{}\n",
        note.created_at, note.updated_at, note.title, note.content
    )
}

/// 全ノートを読み込み
pub fn load_notes() -> Vec<Note> {
    let dir = get_notes_dir();
    let mut notes = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |e| e == "md") {
                if let Ok(content) = fs::read_to_string(&path) {
                    let id = path.file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or("")
                        .to_string();
                    notes.push(parse_note_from_md(&id, &content));
                }
            }
        }
    }
    notes
}

/// ノートを保存
pub fn save_note(note: &Note) -> Result<(), String> {
    let path = get_notes_dir().join(format!("{}.md", note.id));
    fs::write(path, note_to_md(note)).map_err(|e| e.to_string())
}

/// ノートを削除
pub fn remove_note_file(id: &str) -> Result<(), String> {
    let path = get_notes_dir().join(format!("{}.md", id));
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())
    } else {
        Ok(())
    }
}

// ===========================================
// 設定
// ===========================================

/// 設定を読み込み
pub fn load_config() -> Option<String> {
    fs::read_to_string(get_config_path()).ok()
}

/// 設定を保存
pub fn save_config(config: &str) -> Result<(), String> {
    fs::write(get_config_path(), config).map_err(|e| e.to_string())
}
