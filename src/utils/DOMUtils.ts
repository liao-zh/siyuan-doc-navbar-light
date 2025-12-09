import { type IProtyle } from "siyuan";
import { CONSTANTS } from "../constants";

/**
 * 移除所有已经插入的内容
 */
export function removeInjected() {
    document.querySelectorAll(`[${CONSTANTS.CONTAINER_ATTR}="${CONSTANTS.CONTAINER_VALUE}"]`).forEach(elem => elem.remove());
}

/**
 * 移除指定protyle中的所有已经插入的内容
 * @param protyle - protyle对象
 */
export function removeInjectedFromProtyle(protyle: IProtyle) {
    protyle.element.querySelectorAll(`[${CONSTANTS.CONTAINER_ATTR}="${CONSTANTS.CONTAINER_VALUE}"]`).forEach(elem => elem.remove());
}

/**
 * 查找protyle中插入的内容（只返回第一个）
 * @param protyle - protyle对象
 * @returns {null|HTMLElement} - 第一个插入的内容
 */
export function selectInjectedInProtyle(protyle: IProtyle): null | HTMLElement {
    return protyle.element.querySelector(`[${CONSTANTS.CONTAINER_ATTR}="${CONSTANTS.CONTAINER_VALUE}"]`);
}

/**
 * 检查指定protyle是否已经插入了内容
 * @param protyle - protyle对象
 * @returns {boolean} - 是否已经插入了内容
 */
export function existInjectedInProtyle(protyle: IProtyle): boolean {
    return protyle.element.querySelector(`[${CONSTANTS.CONTAINER_ATTR}="${CONSTANTS.CONTAINER_VALUE}"]`) !== null;
}

/**
 * 获取所有显示中的文档id
 * @description 从文档层级导航插件复制而来
 * @returns {string[]} - 所有显示中的文档id
 */
export function getAllShowingDocId(): string[] {
    const elemList = document.querySelectorAll("[data-type=wnd] .protyle.fn__flex-1:not(.fn__none) .protyle-background");
    const result = Array.from(elemList).map(elem => elem.getAttribute("data-node-id"));
    return result
}