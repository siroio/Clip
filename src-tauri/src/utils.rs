//! ユーティリティ関数

use std::time::{SystemTime, UNIX_EPOCH};

/// シンプルなUUID生成
pub fn uuid_simple() -> String {
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    format!("{:x}{:x}", duration.as_secs(), duration.subsec_nanos())
}

/// 現在のタイムスタンプ
pub fn timestamp_now() -> String {
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    format!("{}", duration.as_secs())
}
