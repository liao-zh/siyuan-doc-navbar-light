import "./style.css";
import { Plugin } from "siyuan";

import { SettingManager } from "./worker/settingManager";
import { EventHandler } from "./worker/eventHandler";
import { CONSTANTS as C } from "./constants";
import { setPluginInstance } from "./utils/pluginInstance";
import { removeInjected } from "./utils/DOMUtils";
import * as logger from "./utils/logger";

export default class PluginDocBreadcrumbLight extends Plugin {
    settingManager: SettingManager;
    eventHandler: EventHandler;

    async onload() {
        logger.logInfo("加载插件");

        // 设置插件实例
        setPluginInstance(this);

        // 初始化
        this.settingManager = new SettingManager();
        this.eventHandler = new EventHandler();

    }

    // 思源 v3.4+ 数据监听机制：覆写声明以避免插件存储数据变化时被整体 reload
    // （未覆写时，收到 sync/overwrite 数据变更会被判定为未感知数据变化而强制整插件重载；
    //   插件已有 eventBus/ws-main 刷新逻辑，因此保持空实现，勿重复刷新）
    onDataChanged() {}

    onLayoutReady() {
        logger.logInfo("布局就绪");

        // 事件处理器绑定
        this.eventHandler.bindHandler();

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
        // 卸载插件时删除插件数据
        this.removeData(`${C.SETTING_STORAGE}.json`).catch(e => {
            logger.logWarn(`卸载时删除插件数据失败：${e.msg}`);
        });
    }

}
