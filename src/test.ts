import { getAllEditor } from "siyuan";
import { getPluginInstance } from "./utils";
import { logLog } from "./logger";
// 各种局部测试

// eventbus
export function testEventbus() {
    const plugin = getPluginInstance();

    // switch-protyle：返回protyle
    plugin.eventBus.on("switch-protyle", (event) => {
        logLog("switch-protyle", event);
        // logLog("switch-protyle", event.detail.protyle.id);
    });

    // loaded-protyle-static：返回protyle
    plugin.eventBus.on("loaded-protyle-static", (event) => {
        logLog("loaded-protyle-static", event);
        // logLog("loaded-protyle-static", event.detail.protyle.id);
    });

    // ws-main：背景，不返回protyle
    plugin.eventBus.on("ws-main", (event) => {
        logLog("ws-main", event);
    });
}


// editor
export function testEditor() {
    const plugin = getPluginInstance();

    // getAllEditor：返回所有protyle，包括所有页签，包括分屏的，但”移到新窗口“后的不返回
    plugin.eventBus.on("switch-protyle", (event) => {
        logLog("getAllEditor", getAllEditor());
    });
}

