/**
 * ユーティリティ関数
 */

declare const marked: { parse: (text: string) => string; setOptions: (opts: unknown) => void };

// Marked初期化
if (typeof marked !== 'undefined') {
    marked.setOptions({ breaks: true, gfm: true });
}

export function parseMarkdown(text: string): string {
    if (typeof marked !== 'undefined' && text) {
        return marked.parse(text);
    }
    return escapeHtml(text);
}

export function escapeHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
    const labels: Record<string, string> = { high: '高', medium: '中', low: '低' };
    return labels[priority] || '中';
}
