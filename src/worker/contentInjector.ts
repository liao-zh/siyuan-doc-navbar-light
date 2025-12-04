// 制作和插入面包屑

import { App, type IProtyle, openTab, Plugin } from "siyuan";
import { type IProtyleInfo, getProtyleInfo, getAdjacentDocs } from "@/utils/protyleUtils";
import { removeInjectedFromProtyle } from "@/utils/DOMUtils";
import { getPluginInstance } from "@/utils/pluginInstance";
import { CONSTANTS } from "@/constants";
import * as logger from "@/utils/logger";


/**
 * 内容注入器
 */
export class ContentInjector {
    private plugin: Plugin

    /**
     * 向指定 protyle 添加元素
     * DOM：面包屑-空格-相邻文档，复用思源的元素类
     * @param protyle 要添加元素的 protyle
     */
    async apply(protyle: IProtyle) {
        // 移除可能的已插入元素
        removeInjectedFromProtyle(protyle);

        // 判断是否存在块面包屑
        const blockBreadcrumb = protyle.element.querySelector(".protyle-breadcrumb");
        if (!blockBreadcrumb) {
            logger.logDebug("插入元素：不存在块面包屑，退出");
            return;
        }

        // 获取插件实例
        this.plugin =  getPluginInstance();
        // 解析protyle
        const protyleInfo = await getProtyleInfo(protyle);
        logger.logDebug("插入元素：protyle信息", protyleInfo);

        // 构建整个面包屑容器
        const div = document.createElement("div");
        div.classList.add("protyle-breadcrumb", CONSTANTS.CLASS_CONTAINER);
        // 插入现有面包屑之前
        blockBreadcrumb.insertAdjacentElement("beforebegin", div);

        // 构建面包屑元素
        const elemBreadcrumb = this.createBreadcrumb(protyleInfo);
        div.appendChild(elemBreadcrumb);

        // 添加空格间距
        // 取消原因：相邻文档中用了影子元素后不需要额外间距了
        // const space = document.createElement("span");
        // space.classList.add("protyle-breadcrumb__space");
        // space.style.maxWidth = CONSTANTS.STYLE_SPACE_MAXWIDTH;
        // div.appendChild(space);

        // 构建相邻文档元素
        const elemAdjacent = await this.createAdjacent(protyleInfo);
        div.appendChild(elemAdjacent);
    }

    /**
     * 构建文档面包屑元素
     * DOM：div容器/{span条目/{图标-文本}，svg箭头}
     * @param protyleInfo - protyle 信息
     * @returns {HTMLElement} - 面包屑元素
     */
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
            this.createBreadcrumbItem(protyleInfo.notebookId, protyleInfo.notebookName, "notebook")
        );

        // 添加中间层级的文档
        for (let i = 0; i < pathItems.length - 1; i++) {
            div.appendChild(this.createBreadcrumbArrow());
            div.appendChild(
                this.createBreadcrumbItem(pathItems[i], hpathItems[i], "doc-middle")
            );
        }

        // 添加最后一层文档
        div.appendChild(this.createBreadcrumbArrow());
        div.appendChild(
            this.createBreadcrumbItem(pathItems[pathItems.length - 1], hpathItems[hpathItems.length - 1], "doc-last")
        );

        return div;
    }

    /**
     * 构建文档面包屑HTML元素中的每个层级
     * DOM：span容器/{图标-文本}
     * @param id - 面包屑项ID
     * @param name - 面包屑项名称
     * @param type：面包屑项类型，notebook笔记本，doc-middle中间层级文档，doc-last最后一层文档
     * @returns {HTMLElement} - 面包屑项元素
     */
    createBreadcrumbItem(id: string, name: string, type: "notebook" | "doc-middle" | "doc-last"): HTMLElement {
        const elem = createItem({
            app: this.plugin.app,
            id,
            name,
            innerHTML: name,
            iconName: type === "notebook" ? "#iconFolder" : "#iconFile", // 笔记本用文件夹图标，文档用文件图标
            isClickable: type !== "notebook", // 除了笔记本，都可以点击
            maxWidth: type === "doc-middle" ? CONSTANTS.STYLE_BREADCRUMBITEM_MAXWIDTH : "none", // 对中间文档限制宽度
        })
        return elem;
    }

    /**
     * 构建面包屑层级之间的箭头
     * @returns {SVGElement} - 面包屑箭头元素
     */
    createBreadcrumbArrow(): SVGElement {
        return createSvg("protyle-breadcrumb__arrow", "#iconRight");
    }

    /**
     * 构建相邻文档元素
     * @param protyleInfo - protyle信息
     * @returns {HTMLElement} - 相邻文档元素
     */
    async createAdjacent(protyleInfo: IProtyleInfo) {
        // 查找相邻文档
        const adjDocs = await getAdjacentDocs(protyleInfo.docId, protyleInfo.notebookId, protyleInfo.path);
        // logger.logDebug("ContentInjector/createAdjacent: 相邻文档", adjDocs);
        // 构建上一篇和下一篇
        const elemPrev = this.createAdjacentItem(adjDocs.prevId, adjDocs.prevName, "prev");
        const elemNext = this.createAdjacentItem(adjDocs.nextId, adjDocs.nextName, "next");

        // 构建容器，保持和面包屑部分样式一致
        const div = document.createElement("div");
        div.classList.add("protyle-breadcrumb__bar", "protyle-breadcrumb__bar--nowrap");
        div.style.minWidth = CONSTANTS.STYLE_ADJACENT_MINWIDTH;
        // 构建假元素，应对有些外观样式（如Savor）会将第一个元素的图标改掉
        const elemShaddow = createItem({
            app: this.plugin.app,
            id: null,
            name: null,
            innerHTML: "",
            iconName: "#iconFile",
            isClickable: false,
            naOpacity: "0",
        })
        // 容器加入假元素、上一篇、下一篇
        div.appendChild(elemShaddow);
        div.appendChild(elemPrev);
        div.appendChild(elemNext);
        return div;
    }

    createAdjacentItem(id: string, name: string , type: "prev" | "next"): HTMLElement {
        const elem = createItem({
            app: this.plugin.app,
            id,
            name,
            innerHTML: type === "prev" ? CONSTANTS.LABEL_ADJACENT_PREV : CONSTANTS.LABEL_ADJACENT_NEXT,
            iconName: type === "prev" ? "#iconBack" : "#iconForward",
            isClickable: (id !== null), // 存在相邻文档时才可点击
            naOpacity: CONSTANTS.STYLE_DISABLED_OPACITY, // 不可点击时灰化
        })
        return elem
    }
}

/**
 * 构建面包屑条目样式的元素
 * DOM：span容器/{图标-文本}
 * @param id - 文档或笔记本ID
 * @param name - 文档或笔记本名称
 * @param innerHTML - 要显示的文本内容
 * @param iconName - 图标名称
 * @param isClickable - 是否可点击
 * @param app - 思源插件app
 * @param maxWidth? - 最大宽度
 * @param naOpacity? - 不可点击时的透明度
 * @returns {HTMLElement} - 面包屑项元素
 */
function createItem({
        app,
        id,
        name,
        innerHTML,
        iconName,
        isClickable,
        maxWidth,
        naOpacity,
    }: {
        app: App;
        id: string;
        name: string;
        innerHTML: string;
        iconName: string;
        isClickable: boolean;
        maxWidth?: string;
        naOpacity?: string;
    }): HTMLElement {
    // 构建容器
    const elem = document.createElement("span");
    elem.classList.add("protyle-breadcrumb__item");
    maxWidth && (elem.style.maxWidth = maxWidth);

    // 构建图标
    const svg = createSvg("popover__block", iconName);
    elem.appendChild(svg);

    // 构建文本元素
    const text = document.createElement("span");
    text.classList.add("protyle-breadcrumb__text");
    name && (text.title = name); // name有值时才设置title
    text.innerHTML = innerHTML;
    elem.appendChild(text);

    // 如果可点击，则添加id和点击事件
    if (isClickable) {
        elem.dataset.nodeId = id;
        svg.dataset.id = id;
        elem.addEventListener("click", clickHandler.bind(null, app, id));
        elem.style.cursor = "pointer";
    } else {
        naOpacity && (elem.style.opacity = naOpacity);
        elem.style.cursor = "default";
    }

    return elem;
}

/**
 * 构建SVG图标元素
 * @param className - 图标类名
 * @param iconName - 图标名称
 * @returns {SVGElement} - 图标元素
 */
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

/**
 * 点击事件处理函数
 * @param app - 思源插件app
 * @param id - 文档id
 * @param event - 鼠标事件
 */
function clickHandler(app: App, id: string, event: MouseEvent) {
    event.stopPropagation();
    // 打开新标签页
    openTab({
        app: app,
        doc: {
            id,
        },
        // 条件属性：只有在按下辅助按键时才添加position属性
        // 如果多个键同时按下，后面属性覆盖前面
        ...(event.altKey && { position: "right" }), // 用alt，与思源默认行为一致
        // ...(e.shiftKey && { position: "bottom" }),
    });
}