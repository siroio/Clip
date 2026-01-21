/**
 * Clip アプリケーション状態管理
 */

import type { Task, Note, AppState } from '../types/plugin';
import { invoke } from './tauri';
import { getConfig } from './config';
import { parseMarkdown, escapeHtml, getPriorityLabel } from './utils';

// アプリ状態
export const state: AppState = {
    currentView: 'tasks',
    tasks: [],
    notes: [],
    currentNoteId: null,
    taskFilter: 'all',
    noteEditorTab: 'edit',
    isEditing: false,
    lastEditTime: 0,
};

// DOM要素参照
export let elements: {
    navItems: NodeListOf<HTMLElement>;
    views: NodeListOf<HTMLElement>;
    taskList: HTMLElement | null;
    addTaskBtn: HTMLElement | null;
    taskModal: HTMLElement | null;
    taskInput: HTMLTextAreaElement | null;
    taskPriority: HTMLSelectElement | null;
    submitTaskBtn: HTMLElement | null;
    cancelTaskBtn: HTMLElement | null;
    filterBtns: NodeListOf<HTMLElement>;
    notesList: HTMLElement | null;
    noteEditor: HTMLElement | null;
    addNoteBtn: HTMLElement | null;
    noteTitle: HTMLInputElement | null;
    noteContent: HTMLTextAreaElement | null;
    saveNoteBtn: HTMLElement | null;
    cancelNoteBtn: HTMLElement | null;
    deleteNoteBtn: HTMLElement | null;
    noteEditPane: HTMLElement | null;
    notePreviewPane: HTMLElement | null;
    notePreview: HTMLElement | null;
    tabBtns: NodeListOf<HTMLElement>;
    toggleOntopBtn: HTMLElement | null;
};

// DOM要素を初期化
export function initElements(): void {
    elements = {
        navItems: document.querySelectorAll('.nav-item'),
        views: document.querySelectorAll('.view'),
        taskList: document.getElementById('task-list'),
        addTaskBtn: document.getElementById('add-task-btn'),
        taskModal: document.getElementById('task-modal'),
        taskInput: document.getElementById('task-input') as HTMLTextAreaElement,
        taskPriority: document.getElementById('task-priority') as HTMLSelectElement,
        submitTaskBtn: document.getElementById('submit-task-btn'),
        cancelTaskBtn: document.getElementById('cancel-task-btn'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        notesList: document.getElementById('notes-list'),
        noteEditor: document.getElementById('note-editor'),
        addNoteBtn: document.getElementById('add-note-btn'),
        noteTitle: document.getElementById('note-title') as HTMLInputElement,
        noteContent: document.getElementById('note-content') as HTMLTextAreaElement,
        saveNoteBtn: document.getElementById('save-note-btn'),
        cancelNoteBtn: document.getElementById('cancel-note-btn'),
        deleteNoteBtn: document.getElementById('delete-note-btn'),
        noteEditPane: document.getElementById('note-edit-pane'),
        notePreviewPane: document.getElementById('note-preview-pane'),
        notePreview: document.getElementById('note-preview'),
        tabBtns: document.querySelectorAll('.tab-btn'),
        toggleOntopBtn: document.getElementById('toggle-ontop'),
    };

    // autocomplete無効化
    [elements.taskInput, elements.noteTitle, elements.noteContent].forEach(el => {
        if (el) {
            el.setAttribute('autocomplete', 'off');
            el.setAttribute('autocorrect', 'off');
            el.setAttribute('spellcheck', 'false');
        }
    });
}

// データ読み込み
export async function loadData(): Promise<void> {
    try {
        const data = await invoke<{ tasks: Task[]; notes: Note[] }>('get_data');
        state.tasks = data.tasks || [];
        state.notes = data.notes || [];
    } catch (err) {
        console.error('データ読み込みエラー:', err);
    }
}

// タスク一覧レンダリング
export function renderTasks(): void {
    if (!elements.taskList) return;

    let tasks = [...state.tasks];

    if (state.taskFilter === 'active') {
        tasks = tasks.filter((t) => !t.completed);
    } else if (state.taskFilter === 'completed') {
        tasks = tasks.filter((t) => t.completed);
    }

    tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    });

    if (tasks.length === 0) {
        elements.taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✓</div>
        <div class="empty-state-text">タスクがありません</div>
      </div>
    `;
        return;
    }

    elements.taskList.innerHTML = tasks
        .map(
            (task) => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <div class="task-checkbox" onclick="toggleTask('${task.id}')"></div>
      <div class="task-content">
        <div class="task-text"><span class="markdown-body">${parseMarkdown(task.text)}</span></div>
        <div class="task-meta">
          <span class="task-priority ${task.priority}">${getPriorityLabel(task.priority)}</span>
        </div>
      </div>
      <button class="task-delete" onclick="deleteTask('${task.id}')" title="削除">✕</button>
    </div>
  `
        )
        .join('');
}

// メモ一覧レンダリング
export function renderNotes(): void {
    if (!elements.notesList) return;

    if (state.notes.length === 0) {
        elements.notesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">メモがありません</div>
      </div>
    `;
        if (!state.isEditing) {
            elements.noteEditor?.classList.add('hidden');
        }
        return;
    }

    elements.notesList.innerHTML = state.notes
        .map(
            (note) => `
    <div class="note-item ${state.currentNoteId === note.id ? 'active' : ''}" 
         data-id="${note.id}" 
         onclick="selectNote('${note.id}')">
      <div class="note-item-title">${escapeHtml(note.title) || '無題'}</div>
      <div class="note-item-preview">${escapeHtml(note.content.slice(0, 80))}</div>
    </div>
  `
        )
        .join('');
}

// 同期開始
export function startSync(): void {
    const config = getConfig();
    setInterval(async () => {
        if (!state.isEditing) {
            await loadData();
            renderTasks();
            renderNotes();
        }
    }, config.syncInterval);
}
