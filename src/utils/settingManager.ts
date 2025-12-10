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
        const i18nSetting = this.plugin.i18n.setting;
        this.settingUtils = new SettingUtils({
            plugin: this.plugin, name: CONSTANTS.STORAGE_NAME
        });
        this.settingUtils.addItem({
            key: "pinAdjacentRight",
            value: true,
            type: "checkbox",
            title: i18nSetting.pinAdjacentRight.title,
            description: i18nSetting.pinAdjacentRight.description,
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
            title: i18nSetting.enableNewDoc.title,
            description: i18nSetting.enableNewDoc.description,
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