// 制作和插入面包屑

import { App, type IProtyle, openTab, Plugin } from "siyuan";
import { type IProtyleInfo, getProtyleInfo, getAdjacentDocs } from "@/utils/processProtyle";
import { getPluginInstance } from "@/utils/pluginInstance";
import { CONSTANTS } from "@/constants";
import * as logger from "@/utils/logger";




export class ContentInjector {
    private plugin: Plugin

    constructor() {
        this.plugin =  getPluginInstance();
    }

    async apply(protyle: IProtyle, replace: boolean = false) {
        // 检查是否已经插入元素
        // 如果已经插入且replace，则移除已插入元素
        const existDiv = protyle.element.querySelector(`.${CONSTANTS.CLASS_CONTAINER}`);
        if (existDiv) {
            if (replace) {
                protyle.element.querySelectorAll(`.${CONSTANTS.CLASS_CONTAINER}`).forEach(elem => {
                    elem.remove();
                });
            } else {
                return;
            }
        }

        // 解析protyle
        const protyleInfo = await getProtyleInfo(protyle);

        logger.logLog("protyle", protyle);
        logger.logLog("protyleInfo", protyleInfo);

        // 构建容器
        let div = document.createElement("div");
        div.classList.add("protyle-breadcrumb", CONSTANTS.CLASS_CONTAINER);
        protyle.element.querySelector(".protyle-breadcrumb").insertAdjacentElement("beforebegin", div);

        // 构建面包屑
        div.appendChild(this.createBreadcrumb(protyleInfo));

        // 添加空格
        let space = document.createElement("span");
        space.classList.add("protyle-breadcrumb__space");
        space.style.maxWidth = "12px"
        div.appendChild(space);

        // 构建相邻文档
        const { elemPrev, elemNext } = await this.createAdjacent(protyleInfo);
        div.appendChild(elemPrev);
        div.appendChild(elemNext);
    }

    // 构建文档面包屑HTML元素
    createBreadcrumb(protyleInfo: IProtyleInfo): HTMLElement {
        // 路径分段
        const pathItems = protyleInfo.path.replace(/\.sy$/, '').split("/").slice(1);
        const hpathItems = protyleInfo.hpath.split("/").slice(1);

        // 创建容器
        let div = document.createElement("div");
        div.classList.add("protyle-breadcrumb__bar", "protyle-breadcrumb__bar--nowrap");

        // 添加笔记本
        div.appendChild(
            this.createBreadcrumbItem(protyleInfo.docId, protyleInfo.notebookName, "#iconFolder", false)
        );

        // 添加箭头和路径上的文档
        for (let i = 0; i < pathItems.length; i++) {
            div.appendChild(this.createBreadcrumbArrow());
            div.appendChild(
                this.createBreadcrumbItem(pathItems[i], hpathItems[i], "#iconFile", true)
            )
        }

        return div;
    }

    // 构建文档面包屑HTML元素中的每个层级
    createBreadcrumbItem(id: string, name: string, iconName: string, isFile: boolean = true): HTMLElement {

        // 构建容器
        let elem = document.createElement("span");
        elem.classList.add("protyle-breadcrumb__item");

        // 构建xvg和xlink
        let svg = createSvg("popover__block", iconName);
        elem.appendChild(svg);

        // 构建文本元素
        let text = document.createElement("span");
        text.classList.add("protyle-breadcrumb__text");
        text.title = name;
        text.innerHTML = name;
        elem.appendChild(text);

        // 如果是文档而非笔记本，添加id和点击事件
        if (isFile) {
            elem.dataset.nodeId = id;
            svg.dataset.id = id;
            elem.addEventListener("click", clickHandler.bind(this, this.plugin.app, id));
            elem.style.cursor = "pointer";
        } else {
            // elem.style.opacity = CONSTANTS.STYLE_DISABLED_OPACITY;
            elem.style.cursor = "default";
        }

        return elem;
    }

    // 构建面包屑层级之间的箭头
    createBreadcrumbArrow(): SVGElement {
        return createSvg("protyle-breadcrumb__arrow", "#iconRight");
    }

    // 构建相邻文档
    async createAdjacent(protyleInfo: IProtyleInfo) {
        // 查找相邻文档
        const adjDocs = await getAdjacentDocs(protyleInfo.docId, protyleInfo.notebookId, protyleInfo.path);
        logger.logLog("adjDocs", adjDocs);

        const elemPrev = this.createAdjacentItem(adjDocs.prevId, adjDocs.prevName, "上一篇", "#iconBack");
        const elemNext = this.createAdjacentItem(adjDocs.nextId, adjDocs.nextName, "下一篇", "#iconForward");

        return { elemPrev, elemNext };
    }

    createAdjacentItem(id: string | null, name: string | null, displayName: string, iconName: string): HTMLElement {
        // 构建容器
        let elem = document.createElement("span");
        elem.classList.add("protyle-breadcrumb__item");

        // 构建xvg和xlink
        let svg = createSvg("popover__block", iconName);
        elem.appendChild(svg);

        // 构建文本元素
        let text = document.createElement("span");
        text.classList.add("protyle-breadcrumb__text");
        text.innerHTML = displayName;
        elem.appendChild(text);

        // 添加id
        if (id !== null) {
            elem.dataset.nodeId = id;
            svg.dataset.id = id;
            text.title = name;
            elem.addEventListener("click", clickHandler.bind(this, this.plugin.app, id));
            elem.style.cursor = "pointer";
        } else {
            elem.style.opacity = CONSTANTS.STYLE_DISABLED_OPACITY;
            elem.style.cursor = "default";
        }

        // 添加点击事件

        return elem;
    }

}

function createSvg(className: string, iconName: string): SVGElement {
    // 命名空间
    const nsSvg = "http://www.w3.org/2000/svg";
    const nsXlink = "http://www.w3.org/1999/xlink";

    // 构建xvg
    let svg = document.createElementNS(nsSvg, "svg");
    svg.classList.add(className);

    // 构建xlink
    let xlink = document.createElementNS(nsSvg, "use");
    xlink.setAttributeNS(nsXlink, "xlink:href", iconName);
    svg.appendChild(xlink);

    return svg;
}

function clickHandler(app: App, id: string, e: MouseEvent) {
    e.stopPropagation();
    openTab({
        app: app,
        doc: {
            id,
        },
    });
}