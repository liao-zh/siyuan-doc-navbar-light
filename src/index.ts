import { Plugin } from "siyuan";
import "@/index.scss";

import { SettingManager } from "./worker/settingManager";
import { EventHandler } from "./worker/eventHandler";
import { CONSTANTS as C } from "./constants";
import { setPluginInstance } from "./utils/pluginInstance";
import { removeInjected } from "./utils/DOMUtils";
import * as logger from "./utils/logger";
import * as test from "./test/test";

export default class PluginDocBreadcrumbLight extends Plugin {
    settingManager: SettingManager;
    eventHandler: EventHandler;

    async onload() {
        logger.logInfo("加载插件");

        this.data[C.SETTING_STORAGE] = { Check: true };

        // 设置插件实例
        setPluginInstance(this);

        // 设置插件设置
        this.settingManager = new SettingManager();

        // 事件处理器初始化
        this.eventHandler = new EventHandler();

    }

    onLayoutReady() {
        logger.logInfo("布局就绪");

        // 事件处理器绑定
        this.eventHandler.bindHandler();

        // 测试
        // test.testEventbus();
    }

    async onunload() {
        logger.logInfo("关闭插件");
        // 事件处理器解绑
        this.eventHandler.unbindHandler();
        // 移除所有已经插入的元素
        removeInjected();
    }

    async uninstall() {
        logger.logInfo("卸载插件");
        await this.onunload();
    }

}
