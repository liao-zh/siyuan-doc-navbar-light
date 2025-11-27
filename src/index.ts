import {
    Plugin,
    showMessage,
    getFrontend,
} from "siyuan";
import "@/index.scss";

import { CONSTANTS } from "./constants";
import { logDebug, logInfo, logLog, logError, logWarn } from "./logger";
import { setPluginInstance } from "./utils";
import EventHandler from "./eventHandler";
import { testEventbus, testEditor, testHPath, testProtyle } from "./test";

const STORAGE_NAME = "menu-config";

export default class DocBreadcrumbSimp extends Plugin {

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
        // testHPath();
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
