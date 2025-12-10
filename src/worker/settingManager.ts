// 管理设置
import { SettingUtils } from "@/libs/setting-utils";
import { getPluginInstance } from "@/utils/pluginInstance";
import { CONSTANTS as C } from "@/constants";
import * as logger from "@/utils/logger";

/**
 * 管理插件设置
 */
export class SettingManager {
    private settingUtils: SettingUtils;
    private plugin = getPluginInstance();

    constructor() {
        // 初始化设置
        this.initSettingUtils();
        // 从存储加载设置
        this.settingUtils.load();
    }

    /**
     * 初始化设置工具
     */
    initSettingUtils() {
        const i18nSetting = this.plugin.i18n.setting;

        // 设置工具初始化
        this.settingUtils = new SettingUtils({
            plugin: this.plugin,
            name: C.SETTING_STORAGE,
            height: C.SETTING_STORAGE_HEIGHT,
            callback: (data) => {
                this.plugin.eventHandler.handleProtyleAllShowing();
                logger.logDebug("设置完成", data);
            }
        });

        // 添加设置项
        this.settingUtils.addItem({
            key: C.SETTING_KEY_ADJACENTDOC,
            value: true,
            type: "checkbox",
            title: i18nSetting[C.SETTING_KEY_ADJACENTDOC]["title"],
            description: i18nSetting[C.SETTING_KEY_ADJACENTDOC]["description"],
            action: {
                callback: () => {
                    let value = !this.settingUtils.get(C.SETTING_KEY_ADJACENTDOC);
                    this.settingUtils.setAndSave(C.SETTING_KEY_ADJACENTDOC, value);
                    logger.logDebug(`设置：${C.SETTING_KEY_ADJACENTDOC}`, value);
                }
            }
        });
        this.settingUtils.addItem({
            key: C.SETTING_KEY_NEWDOC,
            value: false,
            type: "checkbox",
            title: i18nSetting[C.SETTING_KEY_NEWDOC]["title"],
            description: i18nSetting[C.SETTING_KEY_NEWDOC]["description"],
            action: {
                callback: () => {
                    let value = !this.settingUtils.get(C.SETTING_KEY_NEWDOC);
                    this.settingUtils.setAndSave(C.SETTING_KEY_NEWDOC, value);
                    logger.logDebug(`设置：${C.SETTING_KEY_NEWDOC}`, value);
                }
            }
        });
    }

    /**
     * 获取设置值
     * @param key 设置键
     * @returns 设置值
     */
    get(key: string) {
        return this.settingUtils.get(key);
    }
}