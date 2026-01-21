/**
 * Clip プラグインシステム
 */

import type { Task, Note, ClipPlugin, PluginHooks, PluginAPI, ClipPluginsManager, HookHandler } from '../types/plugin';
import { invoke } from './tauri';
import { getConfig, setConfig, ClipConfig } from './config';
import { parseMarkdown, escapeHtml } from './utils';
import { state, renderTasks, renderNotes } from './state';

class PluginManager implements ClipPluginsManager {
    private plugins: ClipPlugin[] = [];
    private hooks: Record<keyof PluginHooks, HookHandler<unknown>[]> = {
        onTaskAdd: [],
        onTaskComplete: [],
        onTaskDelete: [],
        onNoteAdd: [],
        onNoteSave: [],
        onNoteDelete: [],
        onRender: [],
        onInit: [],
    };

    register(plugin: ClipPlugin): boolean {
        if (!plugin.name) {
            console.error('Plugin must have a name');
            return false;
        }

        this.plugins.push(plugin);
        console.log(`[Clip] Plugin loaded: ${plugin.name}`);

        if (plugin.hooks) {
            for (const [hookName, handler] of Object.entries(plugin.hooks)) {
                const key = hookName as keyof PluginHooks;
                if (this.hooks[key] && handler) {
                    this.hooks[key].push(handler as HookHandler<unknown>);
                }
            }
        }

        if (plugin.init) {
            plugin.init(this.getAPI());
        }

        return true;
    }

    async trigger<T>(hookName: keyof PluginHooks, data: T): Promise<T> {
        const handlers = this.hooks[hookName] || [];
        let result = data;

        for (const handler of handlers) {
            try {
                const newResult = await (handler as HookHandler<T>)(result, this.getAPI());
                if (newResult !== undefined) {
                    result = newResult;
                }
            } catch (err) {
                console.error(`[Clip] Plugin hook error (${hookName}):`, err);
            }
        }

        return result;
    }

    getAPI(): PluginAPI {
        return {
            state: () => ({ ...state }),
            getTasks: () => [...state.tasks],
            getNotes: () => [...state.notes],
            getConfig: () => getConfig() as unknown as Record<string, unknown>,
            setConfig: (updates) => setConfig(updates as Partial<ClipConfig>),
            addTask: async (text: string, priority: Task['priority'] = 'medium') => {
                const task = await invoke<Task>('add_task', { text, priority });
                state.tasks.push(task);
                renderTasks();
                return task;
            },
            addNote: async (title: string, content = '') => {
                const note = await invoke<Note>('add_note', { title, content });
                state.notes.unshift(note);
                renderNotes();
                return note;
            },
            showNotification: (message: string, type = 'info') => {
                console.log(`[Clip Notification] ${type}: ${message}`);
            },
            registerCommand: (name: string, handler: (args?: string) => void) => {
                window.ClipCommands = window.ClipCommands || {};
                window.ClipCommands[name] = handler;
            },
            parseMarkdown,
            escapeHtml,
        };
    }

    getPlugins(): ClipPlugin[] {
        return [...this.plugins];
    }
}

export const pluginManager = new PluginManager();
