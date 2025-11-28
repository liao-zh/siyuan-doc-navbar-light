// 触发事件处理器
import {
    Plugin,
    type IEventBusMap, type IProtyle,
    getAllEditor,
} from "siyuan"
import { ContentInjector } from "@/worker/contentInjector";
import { getPluginInstance } from "@/utils/pluginInstance";
import { getAllShowingDocId, removeInjected } from "@/utils/DOMUtils";
import * as logger from "@/utils/logger";

export class EventHandler {
    private plugin: Plugin;
    private handlerList: Record<string, (arg1: CustomEvent)=>void> = {
        "loaded-protyle-static": this.handleLoadedProtyleStatic.bind(this),
        "switch-protyle": this.handleSwitchProtyle.bind(this),
        "ws-main": this.handleWSMain.bind(this),
    };

    constructor() {
        this.plugin = getPluginInstance();
    }

    bindHandler() {
        // 绑定所有事件处理器
        for (let key in this.handlerList) {
            this.plugin.eventBus.on(key as keyof IEventBusMap, this.handlerList[key]);
        }
        // 首次加载时处理已经打开的文档
        removeInjected();
        this.handleProtyleAllShowing();
    }

    unbindHandler() {
        for (let key in this.handlerList) {
            this.plugin.eventBus.off(key as keyof IEventBusMap, this.handlerList[key]);
        }
    }

    async handleProtyle(protyle: IProtyle, replace: boolean = false) {
        const contentInjector = new ContentInjector();
        await contentInjector.apply(protyle, replace);
    }

    async handleProtyleAllShowing() {
        // 在所有打开的protyle中，仅处理显示着的文档
        // 两个都需要是因为，文档只能得到id，而editor能得到需要的protyle
        const allEditor = getAllEditor();
        const ids = getAllShowingDocId();
        if (ids != null && ids.length > 0) {
            for (let editor of allEditor) {
                if (ids.includes(editor.protyle.block.rootID)) {
                    await this.handleProtyle(editor.protyle, true);
                }
            }
        }
    }

    async handleLoadedProtyleStatic(event: CustomEvent<IEventBusMap["loaded-protyle-static"]>) {
        logger.logDebug("loaded-protyle-static", event);
        const protyle = event.detail.protyle;
        await this.handleProtyle(protyle, false);
    }

    async handleSwitchProtyle(event: CustomEvent<IEventBusMap["switch-protyle"]>) {
        logger.logDebug("switch-protyle", event);
        const protyle = event.detail.protyle;
        await this.handleProtyle(protyle, true);
    }

    async handleWSMain(event: CustomEvent<IEventBusMap["ws-main"]>) {
        const cmdType = ["moveDoc", "rename", "removeDoc"];
        // 仅处理移动、重命名、删除文档事件
        if (cmdType.includes(event.detail.cmd)) {
            logger.logDebug(`ws-main(${cmdType.join('/')})"`, event);
            await this.handleProtyleAllShowing();
        }
    }
}

