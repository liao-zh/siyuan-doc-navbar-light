import { type IProtyle } from "siyuan";
import { CONSTANTS } from "../constants";


export function removeInjected() {
    document.querySelectorAll(`.${CONSTANTS.CLASS_CONTAINER}`).forEach(elem => elem.remove());
}

export function removeInjectedFromProtyle(protyle: IProtyle) {
    protyle.element.querySelectorAll(`.${CONSTANTS.CLASS_CONTAINER}`).forEach(elem => elem.remove());
}

// 获取所有显示中的文档id
// 从文档层级导航插件复制而来
export function getAllShowingDocId(): string[] {
    const elemList = document.querySelectorAll("[data-type=wnd] .protyle.fn__flex-1:not(.fn__none) .protyle-background");
    const result = Array.from(elemList).map(elem => elem.getAttribute("data-node-id"));
    return result
}