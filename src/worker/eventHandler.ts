// 触发事件处理器
import {
    Plugin,
    type IEventBusMap, type IProtyle
} from "siyuan"
import { ContentInjector } from "@/worker/contentInjector";
import { getPluginInstance } from "@/utils/pluginInstance";
import { logLog } from "@/utils/logger";

export default class EventHandler {
    private plugin: Plugin;
    private handlerList: Record<string, (arg1: CustomEvent)=>void> = {
        "loaded-protyle-static": this.handleLoadedProtyleStatic.bind(this),
        "switch-protyle": this.handleSwitchProtyle.bind(this),
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

    async processProtyle(protyle: IProtyle) {
        const contentInjector = new ContentInjector();
        await contentInjector.apply(protyle, true);
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