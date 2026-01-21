/**
 * Clip - メインエントリポイント
 */

import type { Task, Note } from './types/plugin';
import { invoke, getCurrentWindow } from './lib/tauri';
import { loadConfig, getConfig, setConfig } from './lib/config';
import { pluginManager } from './lib/plugins';
import { state, elements, initElements, loadData, renderTasks, renderNotes, startSync } from './lib/state';
import { parseMarkdown } from './lib/utils';

// グローバル登録
window.ClipPlugins = pluginManager;

// ===========================================
// 初期化
// ===========================================
async function init(): Promise<void> {
    initElements();
    await loadConfig();
    await loadData();
    setupEventListeners();
    render();
    startSync();
    await pluginManager.trigger('onInit', {});
}

// ===========================================
// イベント
// ===========================================
function setupEventListeners(): void {
    // ナビゲーション
    elements.navItems.forEach((item) => {
        item.addEventListener('click', () => switchView(item.dataset.view as 'tasks' | 'notes'));
    });

    // フィルター
    elements.filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            state.taskFilter = btn.dataset.filter as 'all' | 'active' | 'completed';
            renderTasks();
        });
    });

    // タスク
    elements.addTaskBtn?.addEventListener('click', openTaskModal);
    elements.submitTaskBtn?.addEventListener('click', submitTask);
    elements.cancelTaskBtn?.addEventListener('click', closeTaskModal);
    elements.taskModal?.addEventListener('click', (e) => {
        if (e.target === elements.taskModal) closeTaskModal();
    });
    elements.taskInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) submitTask();
        else if (e.key === 'Escape') closeTaskModal();
    });

    // メモ
    elements.addNoteBtn?.addEventListener('click', createNewNote);
    elements.saveNoteBtn?.addEventListener('click', saveCurrentNote);
    elements.cancelNoteBtn?.addEventListener('click', cancelNoteEdit);
    elements.deleteNoteBtn?.addEventListener('click', deleteCurrentNote);
    elements.tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => switchNoteTab(btn.dataset.tab as 'edit' | 'preview'));
    });

    // 編集フラグ
    elements.noteTitle?.addEventListener('input', markAsEditing);
    elements.noteContent?.addEventListener('input', markAsEditing);
    elements.noteTitle?.addEventListener('focus', () => { state.isEditing = true; });
    elements.noteContent?.addEventListener('focus', () => { state.isEditing = true; });
    elements.noteTitle?.addEventListener('blur', () => setTimeout(() => { state.isEditing = false; }, 100));
    elements.noteContent?.addEventListener('blur', () => setTimeout(() => { state.isEditing = false; }, 100));

    // 最前面
    elements.toggleOntopBtn?.addEventListener('click', toggleAlwaysOnTop);
}

function markAsEditing(): void {
    state.isEditing = true;
    state.lastEditTime = Date.now();
}

// ===========================================
// ビュー
// ===========================================
function switchView(view: 'tasks' | 'notes'): void {
    state.currentView = view;
    elements.navItems.forEach((item) => item.classList.toggle('active', item.dataset.view === view));
    elements.views.forEach((v) => v.classList.toggle('hidden', v.id.replace('-view', '') !== view));
}

function switchNoteTab(tab: 'edit' | 'preview'): void {
    state.noteEditorTab = tab;
    elements.tabBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));

    if (tab === 'edit') {
        if (elements.noteEditPane) elements.noteEditPane.style.display = 'flex';
        if (elements.notePreviewPane) elements.notePreviewPane.style.display = 'none';
    } else {
        if (elements.noteEditPane) elements.noteEditPane.style.display = 'none';
        if (elements.notePreviewPane) elements.notePreviewPane.style.display = 'flex';
        const content = `# ${elements.noteTitle?.value || ''}\n\n${elements.noteContent?.value || ''}`;
        if (elements.notePreview) elements.notePreview.innerHTML = parseMarkdown(content);
    }
}

async function render(): Promise<void> {
    renderTasks();
    renderNotes();
    await pluginManager.trigger('onRender', { state });
}

// ===========================================
// タスク
// ===========================================
function openTaskModal(): void {
    elements.taskModal?.classList.remove('hidden');
    if (elements.taskInput) elements.taskInput.value = '';
    if (elements.taskPriority) elements.taskPriority.value = 'medium';
    elements.taskInput?.focus();
}

function closeTaskModal(): void {
    elements.taskModal?.classList.add('hidden');
    if (elements.taskInput) elements.taskInput.value = '';
}

async function submitTask(): Promise<void> {
    const text = elements.taskInput?.value.trim();
    if (!text) return;

    let taskData = { text, priority: (elements.taskPriority?.value || 'medium') as Task['priority'] };
    taskData = await pluginManager.trigger('onTaskAdd', taskData);

    const task = await invoke<Task>('add_task', taskData);
    state.tasks.push(task);
    closeTaskModal();
    renderTasks();
}

async function toggleTask(id: string): Promise<void> {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    await invoke('update_task', { id, completed: !task.completed });
    task.completed = !task.completed;
    if (task.completed) await pluginManager.trigger('onTaskComplete', { task });
    renderTasks();
}

async function deleteTask(id: string): Promise<void> {
    await pluginManager.trigger('onTaskDelete', { id });
    await invoke('delete_task', { id });
    state.tasks = state.tasks.filter((t) => t.id !== id);
    renderTasks();
}

// ===========================================
// メモ
// ===========================================
async function createNewNote(): Promise<void> {
    let noteData = { title: '', content: '' };
    noteData = await pluginManager.trigger('onNoteAdd', noteData);

    const note = await invoke<Note>('add_note', noteData);
    state.notes.unshift(note);
    state.currentNoteId = note.id;
    renderNotes();
    showNoteEditor(note);
}

function selectNote(id: string): void {
    if (state.currentNoteId && state.isEditing) saveCurrentNoteSync();
    state.currentNoteId = id;
    const note = state.notes.find((n) => n.id === id);
    if (note) {
        showNoteEditor(note);
        renderNotes();
    }
}

function showNoteEditor(note: Note): void {
    elements.noteEditor?.classList.remove('hidden');
    if (elements.noteTitle) elements.noteTitle.value = note.title || '';
    if (elements.noteContent) elements.noteContent.value = note.content || '';
    state.isEditing = false;
    switchNoteTab('edit');
    elements.noteTitle?.focus();
}

function saveCurrentNoteSync(): void {
    if (!state.currentNoteId) return;
    const note = state.notes.find((n) => n.id === state.currentNoteId);
    if (note && elements.noteTitle && elements.noteContent) {
        note.title = elements.noteTitle.value;
        note.content = elements.noteContent.value;
        invoke('update_note', { id: state.currentNoteId, title: note.title, content: note.content });
    }
}

async function saveCurrentNote(): Promise<void> {
    if (!state.currentNoteId) return;
    const noteData = { id: state.currentNoteId, title: elements.noteTitle?.value || '', content: elements.noteContent?.value || '' };
    await pluginManager.trigger('onNoteSave', noteData);
    await invoke('update_note', noteData);

    const note = state.notes.find((n) => n.id === state.currentNoteId);
    if (note) { note.title = noteData.title; note.content = noteData.content; }
    state.isEditing = false;
    renderNotes();
}

async function deleteCurrentNote(): Promise<void> {
    if (!state.currentNoteId) return;
    await pluginManager.trigger('onNoteDelete', { id: state.currentNoteId });
    await invoke('delete_note', { id: state.currentNoteId });
    state.notes = state.notes.filter((n) => n.id !== state.currentNoteId);
    state.currentNoteId = null;
    state.isEditing = false;
    elements.noteEditor?.classList.add('hidden');
    renderNotes();
}

function cancelNoteEdit(): void {
    state.currentNoteId = null;
    state.isEditing = false;
    elements.noteEditor?.classList.add('hidden');
    renderNotes();
}

// ===========================================
// その他
// ===========================================
let isAlwaysOnTop = false;

async function toggleAlwaysOnTop(): Promise<void> {
    const win = getCurrentWindow();
    isAlwaysOnTop = !isAlwaysOnTop;
    await win.setAlwaysOnTop(isAlwaysOnTop);
    elements.toggleOntopBtn?.classList.toggle('active', isAlwaysOnTop);
}

// グローバル公開
(window as unknown as Record<string, unknown>).toggleTask = toggleTask;
(window as unknown as Record<string, unknown>).deleteTask = deleteTask;
(window as unknown as Record<string, unknown>).selectNote = selectNote;
(window as unknown as Record<string, unknown>).ClipConfig = { get: getConfig, set: setConfig };

// 初期化
document.addEventListener('DOMContentLoaded', init);
