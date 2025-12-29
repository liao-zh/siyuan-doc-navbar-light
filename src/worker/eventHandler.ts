// 触发事件处理器
import {
    Plugin,
    type IEventBusMap,
    getAllEditor,
} from "siyuan"
import { ContentRenderer } from "@/worker/contentRenderer";
import { TaskProcessor } from "@/worker/taskProcessor";
import { getPluginInstance } from "@/utils/pluginInstance";
import { getAllShowingDocId, removeInjected } from "@/utils/DOMUtils";
import * as logger from "@/utils/logger";


/**
 * 事件处理器
 */
export class EventHandler {
    private plugin: Plugin;
    private contentRenderer: ContentRenderer;
    private taskProcessor: TaskProcessor;
    private handlerList: Record<string, (arg1: CustomEvent)=>void> = {
        "loaded-protyle-static": this.handleLoadedProtyleStatic.bind(this),
        "switch-protyle": this.handleSwitchProtyle.bind(this),
        "ws-main": this.handleWSMain.bind(this),
    };

    /**
     * 构造函数
     */
    constructor() {
        this.plugin = getPluginInstance();
        this.contentRenderer = new ContentRenderer();
        this.taskProcessor = new TaskProcessor(this.contentRenderer);
    }

    /**
     * 绑定事件处理器
    */
   bindHandler() {
        // 清理：DOM，vnode缓存，任务队列
        removeInjected();
        this.contentRenderer.clearAllCache();
        this.taskProcessor.clearAllTasks();

        // 绑定所有事件处理器
        for (let key in this.handlerList) {
            this.plugin.eventBus.on(key as keyof IEventBusMap, this.handlerList[key]);
        }

        // 首次加载时处理已经打开的文档
        this.handleProtyleAllShowing();
    }

    /**
     * 解绑事件处理器
     */
    unbindHandler() {
        // 解绑所有事件处理器
        for (let key in this.handlerList) {
            this.plugin.eventBus.off(key as keyof IEventBusMap, this.handlerList[key]);
        }

        // 清理：DOM，vnode缓存，任务队列
        removeInjected();
        this.contentRenderer.clearAllCache();
        this.taskProcessor.clearAllTasks();
    }

    /**
     * 处理所有显示中的文档
     */
    async handleProtyleAllShowing() {
        // 在所有打开的protyle中，仅处理显示着的文档
        // editor和id都需要，因为文档只能得到id，而editor能得到需要的protyle
        const allEditor = getAllEditor();
        const ids = getAllShowingDocId();
        if (ids != null && ids.length > 0) {
            for (let editor of allEditor) {
                if (ids.includes(editor.protyle.block.rootID)) {
                    this.taskProcessor.addTask({protyle: editor.protyle, replace: true});
                }
            }
        }
    }

    /**
     * 处理加载静态文档事件
     * @param event - 加载静态文档事件
     */
    async handleLoadedProtyleStatic(event: CustomEvent<IEventBusMap["loaded-protyle-static"]>) {
        // logger.logDebug("触发事件：loaded-protyle-static", event);
        const protyle = event.detail.protyle;
        this.taskProcessor.addTask({protyle, replace: false});
    }

    /**
     * 处理切换文档事件
     * @param event - 切换文档事件
     */
    async handleSwitchProtyle(event: CustomEvent<IEventBusMap["switch-protyle"]>) {
        // logger.logDebug("触发事件：switch-protyle", event);
        const protyle = event.detail.protyle;
        this.taskProcessor.addTask({protyle, replace: false});
    }

    /**
     * 处理主WebSocket事件
     * @param event - 主WebSocket事件
     */
    async handleWSMain(event: CustomEvent<IEventBusMap["ws-main"]>) {
        // logger.logDebug("ws-main事件：", event.detail.cmd);
        const cmdType = ["moveDoc", "rename", "removeDoc", "create"];
        // 仅处理移动、重命名、删除、新建文档事件
        if (cmdType.includes(event.detail.cmd)) {
            // logger.logDebug(`触发事件：ws-main(${event.detail.cmd})"`, event);
            await this.handleProtyleAllShowing();
        }
    }
}

