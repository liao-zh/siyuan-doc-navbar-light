// 触发事件处理器
import {
    Plugin,
    type IEventBusMap, type IProtyle,
    getAllEditor,
} from "siyuan"
import { ContentInjector } from "@/worker/contentInjector";
import { getPluginInstance } from "@/utils/pluginInstance";
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
        for (let key in this.handlerList) {
            this.plugin.eventBus.on(key as keyof IEventBusMap, this.handlerList[key]);
        }
    }

    unbindHandler() {
        for (let key in this.handlerList) {
            this.plugin.eventBus.off(key as keyof IEventBusMap, this.handlerList[key]);
        }
    }

    async handleProtyle(protyle: IProtyle) {
        const contentInjector = new ContentInjector();
        await contentInjector.apply(protyle, true);
    }

    async handleLoadedProtyleStatic(event: CustomEvent<IEventBusMap["loaded-protyle-static"]>) {
        logger.logDebug("loaded-protyle-static", event);
        const protyle = event.detail.protyle;
        await this.handleProtyle(protyle);
    }

    async handleSwitchProtyle(event: CustomEvent<IEventBusMap["switch-protyle"]>) {
        logger.logDebug("switch-protyle", event);
        const protyle = event.detail.protyle;
        await this.handleProtyle(protyle);
    }

    async handleWSMain(event: CustomEvent<IEventBusMap["ws-main"]>) {
        const cmdType = ["moveDoc", "rename", "removeDoc"];
        // 仅处理移动、重命名、删除文档事件
        if (cmdType.includes(event.detail.cmd)) {
            logger.logDebug(`ws-main(${cmdType.join('/')})"`, event);
            // 在所有打开的protyle中，仅处理显示着的文档
            // 两个都需要是因为，文档只能得到id，而editor能得到需要的protyle
            const allEditor = getAllEditor();
            const ids = getAllShowingDocId();
            if (ids != null && ids.length > 0) {
                for (let editor of allEditor) {
                    if (ids.includes(editor.protyle.block.rootID)) {
                        await this.handleProtyle(editor.protyle);
                    }
                }
            }
        }
    }
}

// 获取所有显示中的文档id
function getAllShowingDocId(): string[] {
    const elemList = window.document.querySelectorAll("[data-type=wnd] .protyle.fn__flex-1:not(.fn__none) .protyle-background");
    const result = [].map.call(elemList, function (elem: Element) {
        return elem.getAttribute("data-node-id");
    });
    return result
}