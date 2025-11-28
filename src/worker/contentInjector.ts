// 制作和插入面包屑

import { App, type IProtyle, openTab, Plugin } from "siyuan";
import { type IProtyleInfo, getProtyleInfo, getAdjacentDocs } from "@/utils/processProtyle";
import { getPluginInstance } from "@/utils/pluginInstance";
import { CONSTANTS } from "@/constants";
import * as logger from "@/utils/logger";




export class ContentInjector {
    private plugin: Plugin

    // 向指定protyle添加元素
    // DOM：面包屑-空格-相邻文档，复用思源的元素类
    // @param protyle 要添加元素的protyle
    // @param replace 是否替换已存在的元素
    async apply(protyle: IProtyle, replace: boolean = false) {
        // 检查是否已经插入元素：如果已经插入且replace，则移除已插入元素
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

        // 获取插件实例
        this.plugin =  getPluginInstance();
        // 解析protyle
        const protyleInfo = await getProtyleInfo(protyle);
        logger.logDebug("ContentInjector/apply: protyle", protyle);
        logger.logDebug("ContentInjector/apply: protyleInfo", protyleInfo);

        // 构建整个面包屑容器
        const div = document.createElement("div");
        div.classList.add("protyle-breadcrumb", CONSTANTS.CLASS_CONTAINER);
        // 插入现有面包屑之前
        protyle.element.querySelector(".protyle-breadcrumb").insertAdjacentElement("beforebegin", div);

        // 构建面包屑元素
        div.appendChild(this.createBreadcrumb(protyleInfo));

        // 添加空格
        const space = document.createElement("span");
        space.classList.add("protyle-breadcrumb__space");
        space.style.maxWidth = CONSTANTS.STYLE_SPACE_MAXWIDTH;
        div.appendChild(space);

        // 构建相邻文档元素
        const { elemPrev, elemNext } = await this.createAdjacent(protyleInfo);
        div.appendChild(elemPrev);
        div.appendChild(elemNext);
    }

    // 构建文档面包屑元素
    // DOM：div容器/{span条目/{图标-文本}，svg箭头}
    createBreadcrumb(protyleInfo: IProtyleInfo): HTMLElement {
        // 路径分段
        const pathItems = protyleInfo.path.replace(/\.sy$/, '').split("/").slice(1);
        const hpathItems = protyleInfo.hpath.split("/").slice(1);

        // 创建容器
        const div = document.createElement("div");
        // 复用思源的类，protyle-breadcrumb__bar--nowrap在过长时不分行
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
    // DOM：span容器/{图标-文本}
    createBreadcrumbItem(id: string, name: string, iconName: string, isFile: boolean = true): HTMLElement {
        // 构建容器
        const elem = document.createElement("span");
        elem.classList.add("protyle-breadcrumb__item");
        elem.style.maxWidth = CONSTANTS.STYLE_BREADCRUMBITEM_MAXWIDTH;

        // 构建图标
        const svg = createSvg("popover__block", iconName);
        elem.appendChild(svg);

        // 构建文本元素
        const text = document.createElement("span");
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
        logger.logDebug("ContentInjector/createAdjacent: 相邻文档", adjDocs);

        // 构建上一篇和下一篇
        const elemPrev = this.createAdjacentItem(adjDocs.prevId, adjDocs.prevName, "上一篇", "#iconBack");
        const elemNext = this.createAdjacentItem(adjDocs.nextId, adjDocs.nextName, "下一篇", "#iconForward");
        return { elemPrev, elemNext };
    }

    // 构建相邻文档的单个项目
    // DOM：span容器/{图标-文本}
    createAdjacentItem(id: string | null, name: string | null, displayName: string, iconName: string): HTMLElement {
        // 构建容器
        const elem = document.createElement("span");
        elem.classList.add("protyle-breadcrumb__item");

        // 构建图标
        const svg = createSvg("popover__block", iconName);
        elem.appendChild(svg);

        // 构建文本元素
        const text = document.createElement("span");
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

// 构建SVG图标元素
function createSvg(className: string, iconName: string): SVGElement {
    // 命名空间
    const nsSvg = "http://www.w3.org/2000/svg";
    const nsXlink = "http://www.w3.org/1999/xlink";

    // 构建svg
    const svg = document.createElementNS(nsSvg, "svg");
    svg.classList.add(className);

    // 构建xlink
    const xlink = document.createElementNS(nsSvg, "use");
    xlink.setAttributeNS(nsXlink, "xlink:href", iconName);
    svg.appendChild(xlink);

    return svg;
}

// 点击事件处理函数
// @param app 思源应用实例
// @param id 文档id
// @param e 鼠标事件
function clickHandler(app: App, id: string, e: MouseEvent) {
    e.stopPropagation();
    // 打开新标签页
    openTab({
        app: app,
        doc: {
            id,
        },
        // 条件属性：只有在按下alt或shift键时才添加position属性
        // 如果两个键都按下，后面属性覆盖前面，优先alt
        ...(e.shiftKey && { position: "bottom" }),
        ...(e.altKey && { position: "right" }),
    });
}