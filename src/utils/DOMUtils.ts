import { type IProtyle } from "siyuan";
import { CONSTANTS as C } from "../constants";

/**
 * 移除包装容器前，若思源原生块面包屑被搬入容器内，先还原为容器的兄弟节点
 * 原生面包屑的按钮事件委托在其根元素上，不能被插件误删，移除容器前必须还原
 * @param elem - 插件外包装容器元素
 */
function restoreNativeBreadcrumbBeforeRemove(elem: Element) {
    Array.from(elem.children).forEach(child => {
        if (child instanceof HTMLElement
            && child.classList.contains("protyle-breadcrumb")
            && !child.classList.contains(C.MAIN_CLASS)
            && !child.hasAttribute(C.CONTAINER_ATTR)) {
            elem.insertAdjacentElement("afterend", child);
        }
    });
}

/**
 * 移除所有已经插入的内容
 */
export function removeInjected() {
    document.querySelectorAll(`[${C.CONTAINER_ATTR}="${C.CONTAINER_VALUE}"]`).forEach(elem => {
        restoreNativeBreadcrumbBeforeRemove(elem);
        elem.remove();
    });
}

/**
 * 移除指定protyle中的所有已经插入的内容
 * @param protyle - protyle对象
 */
export function removeInjectedFromProtyle(protyle: IProtyle) {
    protyle.element.querySelectorAll(`[${C.CONTAINER_ATTR}="${C.CONTAINER_VALUE}"]`).forEach(elem => {
        restoreNativeBreadcrumbBeforeRemove(elem);
        elem.remove();
    });
}

/**
 * 查找protyle中插入的内容（只返回第一个）
 * @param protyle - protyle对象
 * @returns {null|HTMLElement} - 第一个插入的内容
 */
export function selectInjectedInProtyle(protyle: IProtyle): null | HTMLElement {
    return protyle.element.querySelector(`[${C.CONTAINER_ATTR}="${C.CONTAINER_VALUE}"]`);
}

/**
 * 检查指定protyle是否已经插入了内容
 * @param protyle - protyle对象
 * @returns {boolean} - 是否已经插入了内容
 */
export function existInjectedInProtyle(protyle: IProtyle): boolean {
    return protyle.element.querySelector(`[${C.CONTAINER_ATTR}="${C.CONTAINER_VALUE}"]`) !== null;
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