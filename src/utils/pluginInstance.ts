import { Plugin } from "siyuan";
import { logError } from "./logger"

/**
 * 插件实例变量
 */
let pluginInstance: Plugin | null = null

/**
 * 设置插件实例
 * @param instance - 插件实例
 */
export function setPluginInstance(instance: Plugin) {
    pluginInstance = instance
}

/**
 * 获取插件实例
 * @returns {Plugin} - 插件实例
 */
export function getPluginInstance(): Plugin {
    if (!pluginInstance) {
        logError("getPluginInstance错误：插件实例未绑定")
    }
    return pluginInstance
}