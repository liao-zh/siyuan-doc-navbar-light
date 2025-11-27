// 触发事件处理器
import {
    type IEventBusMap, type IProtyle
} from "siyuan"
import { getPluginInstance } from "@/utils/pluginInstance";
import { logLog } from "@/utils/logger";

export default class EventHandler {

    private handlerList: Record<string, (arg1: CustomEvent)=>void> = {
        "loaded-protyle-static": this.handleLoadedProtyleStatic.bind(this),
        "switch-protyle": this.handleSwitchProtyle.bind(this),
    };

    bindHandler() {
        const plugin = getPluginInstance();
        for (let key in this.handlerList) {
            plugin.eventBus.on(key as keyof IEventBusMap, this.handlerList[key]);
        }
    }

    unbindHandler() {
        const plugin = getPluginInstance();
        for (let key in this.handlerList) {
            plugin.eventBus.off(key as keyof IEventBusMap, this.handlerList[key]);
        }
    }

    async processProtyle(protyle: IProtyle) {
        logLog("protyle", protyle);
        logLog("protyle.id", protyle.id);
        logLog("protyle.notebookId", protyle.notebookId);
        logLog("protyle.path", protyle.path);
    }

    async handleLoadedProtyleStatic(event: CustomEvent<IEventBusMap["loaded-protyle-static"]>) {
        const protyle = event.detail.protyle;
        logLog("loaded-protyle-static", event);
        await this.processProtyle(protyle);
    }

    async handleSwitchProtyle(event: CustomEvent<IEventBusMap["switch-protyle"]>) {
        const protyle = event.detail.protyle;
        logLog("switch-protyle", event);
        await this.processProtyle(protyle);
    }
}