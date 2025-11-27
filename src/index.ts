import {
    Plugin,
    showMessage,
    getFrontend,
    getBackend,
} from "siyuan";
import "@/index.scss";

import { logDebug, logInfo, logLog, logError, logWarn } from "./logger";
import { CONSTANTS } from "./constants";
import { setPluginInstance } from "./utils";
import { testEventbus } from "./test";

const STORAGE_NAME = "menu-config";

export default class DocBreadcrumbSimp extends Plugin {

    private isMobile: boolean;

    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        logInfo("加载插件");

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        // 绑定插件实例
        setPluginInstance(this);
    }

    onLayoutReady() {
        logInfo("开启插件");

        // 测试
        testEventbus();
    }

    async onunload() {
        logInfo("关闭插件");
    }

    uninstall() {
        logInfo("卸载插件");
    }

}
