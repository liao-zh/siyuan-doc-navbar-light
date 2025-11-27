import {
    Plugin,
    showMessage,
    getFrontend,
} from "siyuan";
import "@/index.scss";

import { CONSTANTS } from "./constants";
import { logDebug, logInfo, logLog, logError, logWarn } from "./utils/logger";
import { setPluginInstance } from "./utils/pluginInstance";
import EventHandler from "./worker/eventHandler";
import { testEventbus, testEditor, testHPath, testProtyle, testHPath2 } from "./test/test";

const STORAGE_NAME = "menu-config";

export default class DocBreadcrumbLight extends Plugin {

    private isMobile: boolean;
    private eventHandler: EventHandler;

    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        logInfo("加载插件");
        setPluginInstance(this);

        this.eventHandler = new EventHandler();

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

    }

    onLayoutReady() {
        logInfo("开启插件");

        this.eventHandler.bindHandler();

        // 测试
        // testHPath2();
        // testProtyle();
    }

    async onunload() {
        logInfo("关闭插件");
        this.eventHandler.unbindHandler();
    }

    uninstall() {
        logInfo("卸载插件");
    }

}
