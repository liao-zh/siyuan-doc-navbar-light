import { getPluginInstance } from "./utils";
import { logLog } from "./logger";
// 各种局部测试

// eventbus
export function testEventbus() {
    const plugin = getPluginInstance();

    plugin.eventBus.on("switch-protyle", (event) => {
        logLog("switch-protyle", event.detail.protyle.id);
    });

    plugin.eventBus.on("loaded-protyle-static", (event) => {
        logLog("loaded-protyle-static", event.detail.protyle.id);
    });

    plugin.eventBus.on("ws-main", (event) => {
        logLog("ws-main", event);
    });
}
