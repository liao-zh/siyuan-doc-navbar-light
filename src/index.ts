import {
    Plugin,
    showMessage,
    getFrontend,
} from "siyuan";
import "@/index.scss";

import { CONSTANTS } from "./constants";
import { setPluginInstance } from "./utils/pluginInstance";
import { EventHandler } from "./worker/eventHandler";
import { removeInjected } from "./utils/DOMUtils";
import * as logger from "./utils/logger";
import * as test from "./test/test";

export default class DocBreadcrumbLight extends Plugin {

    private eventHandler: EventHandler;

    async onload() {
        logger.logInfo("加载插件");

        // 设置插件实例
        setPluginInstance(this);

        // 事件处理器初始化
        this.eventHandler = new EventHandler();
    }

    onLayoutReady() {
        logger.logInfo("开启插件");

        // 事件处理器绑定
        this.eventHandler.bindHandler();

        // 测试
        // test.testListDocs2();
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
