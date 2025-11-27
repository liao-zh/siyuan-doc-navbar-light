import {
    Plugin,
} from "siyuan";
import { logError } from "./logger"

// 处理插件实例的设置和获取
let pluginInstance: Plugin | null = null
export function setPluginInstance(instance: Plugin) {
    pluginInstance = instance
}
export function getPluginInstance(): Plugin {
    if (!pluginInstance) {
        logError("getPluginInstance错误：插件实例未绑定")
    }
    return pluginInstance
}