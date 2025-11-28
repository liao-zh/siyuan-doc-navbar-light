import {
    Plugin,
    showMessage,
    getFrontend,
} from "siyuan";
import "@/index.scss";

import { CONSTANTS } from "./constants";
import * as logger from "./utils/logger";
import { setPluginInstance } from "./utils/pluginInstance";
import EventHandler from "./worker/eventHandler";
import * as test from "./test/test";

const STORAGE_NAME = "menu-config";

export default class DocBreadcrumbLight extends Plugin {

    private isMobile: boolean;
    private eventHandler: EventHandler;

    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        logger.logInfo("加载插件");
        setPluginInstance(this);

        this.eventHandler = new EventHandler();

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

    }

    onLayoutReady() {
        logger.logInfo("开启插件");
        // 绑定事件处理器
        this.eventHandler.bindHandler();

        // 测试
        // test.testListDocs2();
    }

    async onunload() {
        logger.logInfo("关闭插件");
        // 解绑事件处理器
        this.eventHandler.unbindHandler();
        // 移除所有已经插入的元素
        document.querySelectorAll(`.${CONSTANTS.CLASS_CONTAINER}`).forEach((elem) => {
            elem.remove();
        });
    }

    uninstall() {
        logger.logInfo("卸载插件");
    }

}
