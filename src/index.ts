import {
    Plugin,
    showMessage,
    getFrontend,
    getBackend,
} from "siyuan";
import "@/index.scss";

import { logDebug, logInfo, logLog, logError, logWarn } from "./logger";
import { CONSTANTS } from "./constants";

const STORAGE_NAME = "menu-config";
const TAB_TYPE = "custom_tab";
const DOCK_TYPE = "dock_tab";

export default class DocBreadcrumbSimp extends Plugin {

    private isMobile: boolean;

    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };

        logLog(`加载插件`);

        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

    }

    onLayoutReady() {
        logLog(`开启插件`);
    }

    async onunload() {
        logLog(`关闭插件`);
    }

    uninstall() {
        logLog(`卸载插件`);
    }

}
