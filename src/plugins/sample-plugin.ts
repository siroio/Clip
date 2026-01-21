/**
 * サンプルプラグイン - TypeScript版
 */

import type { ClipPlugin, PluginAPI, TaskCompleteData, TaskAddData } from '../types/plugin';

const SamplePlugin: ClipPlugin = {
    name: 'SamplePlugin',
    version: '1.0.0',
    description: 'サンプルプラグイン',

    hooks: {
        onTaskComplete: async (data: TaskCompleteData): Promise<TaskCompleteData> => {
            console.log(`🎉 タスク完了: ${data.task.text}`);
            return data;
        },

        onTaskAdd: async (data: TaskAddData): Promise<TaskAddData> => {
            // @urgent を含むタスクを自動的に高優先度に
            if (data.text.includes('@urgent')) {
                return { ...data, priority: 'high' };
            }
            return data;
        },
    },

    init(api: PluginAPI): void {
        console.log('[SamplePlugin] 初期化完了');
        console.log(`[SamplePlugin] タスク数: ${api.getTasks().length}`);
    },
};

if (window.ClipPlugins) {
    window.ClipPlugins.register(SamplePlugin);
}

export default SamplePlugin;
