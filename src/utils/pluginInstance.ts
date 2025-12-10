// import { Plugin } from "siyuan";
import PluginDocBreadcrumbLight from "@/index";
import { logError } from "@/utils/logger"

/**
 * 插件实例变量
 */
let pluginInstance: PluginDocBreadcrumbLight | null = null

/**
 * 设置插件实例
 * @param instance - 插件实例
 */
export function setPluginInstance(instance: PluginDocBreadcrumbLight) {
    pluginInstance = instance
}

/**
 * 获取插件实例
 * @returns {PluginDocBreadcrumbLight} - 插件实例
 */
export function getPluginInstance(): PluginDocBreadcrumbLight {
    if (!pluginInstance) {
        logError("getPluginInstance错误：插件实例未绑定")
    }
    return pluginInstance
}