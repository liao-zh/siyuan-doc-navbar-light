// 管理设置
import { SettingUtils } from "@/libs/setting-utils";
import { getPluginInstance } from "@/utils/pluginInstance";
import { CONSTANTS } from "@/constants";
import * as logger from "@/utils/logger";

export class SettingManager {
    private settingUtils: SettingUtils;
    private plugin = getPluginInstance();

    constructor() {
        // 初始化设置
        this.initSettingUtils();
        // 从存储加载设置
        this.settingUtils.load();
    }

    initSettingUtils() {
        this.settingUtils = new SettingUtils({
            plugin: this.plugin, name: CONSTANTS.STORAGE_NAME
        });
        this.settingUtils.addItem({
            key: "pinAdjacentRight",
            value: true,
            type: "checkbox",
            title: "将相邻文档按钮固定在右侧",
            description: "选项开启后，相邻文档按钮将固定在右侧，关闭后则按钮随面包屑浮动。",
            action: {
                callback: () => {
                    let value = !this.settingUtils.get("pinAdjacentRight");
                    this.settingUtils.setAndSave("pinAdjacentRight", value);
                    logger.logDebug("设置：pinAdjacentRight", value);
                }
            }
        });
        this.settingUtils.addItem({
            key: "enableNewDoc",
            value: true,
            type: "checkbox",
            title: "启用新建文档功能",
            description: "选项开启后，列出子文档时会显示新建文档按钮，关闭后则不显示。关闭可以防止误触新建文档。",
            action: {
                callback: () => {
                    let value = !this.settingUtils.get("enableNewDoc");
                    this.settingUtils.setAndSave("enableNewDoc", value);
                    logger.logDebug("设置：enableNewDoc", value);
                }
            }
        });
    }

    get(key: string) {
        return this.settingUtils.get(key);
    }
}