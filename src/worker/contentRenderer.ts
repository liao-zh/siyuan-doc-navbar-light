// 制作和插入面包屑

import { type IProtyle, Menu } from "siyuan";
import { CONSTANTS } from "@/constants";
import { getPluginInstance } from "@/utils/pluginInstance";
import * as logger from "@/utils/logger";
import { selectInjectedInProtyle } from "@/utils/DOMUtils";
import { type IProtyleInfo, getProtyleInfo, getAdjacentDocs, getChildDocs, openDocHandler, createDocHandler } from "@/utils/docUtils";
import { init, h, VNode } from "snabbdom";
import { classModule, propsModule, styleModule, eventListenersModule } from "snabbdom";



/**
 * 内容注入器
*/
export class ContentRenderer {
    private patch = init([classModule, propsModule, styleModule, eventListenersModule]);
    private vnodesCache = new Map(); // {protyle.id: vnode}

    /**
     * 更新给定protyle的元素
     * DOM：面包屑-空格-相邻文档，复用思源的元素类
     * @param protyle 要添加元素的 protyle
     */
    async update(protyle: IProtyle) {
        // 判断是否存在块面包屑
        const blockBreadcrumb = protyle.element.querySelector(".protyle-breadcrumb");
        if (!blockBreadcrumb) {
            logger.logDebug("插入元素：不存在块面包屑，退出");
            return;
        }

        // 选择插入的容器，如果没有就创建一个
        let container = selectInjectedInProtyle(protyle);
        if ( container === null ) {
            container = document.createElement("div");
            // 添加自定义属性作为标签
            container.setAttribute(CONSTANTS.CONTAINER_ATTR, CONSTANTS.CONTAINER_VALUE);
            // 插入现有面包屑之前
            blockBreadcrumb.insertAdjacentElement("beforebegin", container);
        }

        // 获取protyle信息
        const protyleInfo = await getProtyleInfo(protyle);
        logger.logDebug("插入元素：protyle信息", protyleInfo);

        // 构建vnode
        const vnodeNew = this.renderProtyle(protyleInfo);

        // 缓存vnode
        const vnodeRec = this.vnodesCache.get(protyleInfo.id);
        let vnodePatch: VNode;
        if ( !vnodeRec ) {
            vnodePatch = this.patch(container, vnodeNew);
        } else {
            vnodePatch = this.patch(vnodeRec, vnodeNew);
        }
        this.vnodesCache.set(protyleInfo.id, vnodePatch);
    }

    /**
     * 从protyle信息构建面包屑元素的vnode
     * @param protyleInfo - protyle 信息
     * @returns {VNode} - 面包屑元素的vnode
     */
    renderProtyle(protyleInfo: IProtyleInfo): VNode {
        // // 构建面包屑元素
        // const elemBreadcrumb = this.createBreadcrumb(protyleInfo);
        // // 构建相邻文档元素
        // const elemAdjacent = await this.createAdjacent(protyleInfo);

        // 合并为一个vnode
        const vnode = h("div.protyle-breadcrumb", {}, `test vnode: id=${protyleInfo.id}, path=${protyleInfo.hpath}`);
        return vnode;
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
        let pathI = "/";
        div.append(
            this.createBreadcrumbItem(protyleInfo.notebookId, protyleInfo.notebookName, "notebook"),
            this.createBreadcrumbArrow(protyleInfo.notebookId, pathI)
        );

        // 添加中间层级的文档
        for (let i = 0; i < pathItems.length - 1; i++) {
            pathI = "/" + pathItems.slice(0, i+1).join("/") + ".sy";
            div.append(
                this.createBreadcrumbItem(pathItems[i], hpathItems[i], "doc-middle"),
                this.createBreadcrumbArrow(protyleInfo.notebookId, pathI)
            );
        }

        // 添加最后一层文档
        pathI = "/" + pathItems.join("/") + ".sy";
        div.append(
            this.createBreadcrumbItem(pathItems[pathItems.length - 1], hpathItems[hpathItems.length - 1], "doc-last"),
            this.createBreadcrumbArrow(protyleInfo.notebookId, pathI)
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
     * @param notebookId - 笔记本id
     * @param path - 文档路径
     * @returns {HTMLElement} - 面包屑箭头元素
     */
    createBreadcrumbArrow(notebookId: string, path: string): HTMLElement {
        // 创建span容器包装svg
        const elem = document.createElement("span");
        elem.style.cursor = "pointer";

        // 创建svg图标
        const svg = createSvg("protyle-breadcrumb__arrow", "#iconRight");
        elem.appendChild(svg);

        // 点击事件：打开子文档菜单
        elem.addEventListener("click", this.listChildDocsHandler.bind(this, notebookId, path));
        return elem;
    }

    /**
     * 点击事件：打开子文档菜单
     * @param notebookId - 笔记本id
     * @param path - 文档路径
     * @param event - 鼠标事件
     */
    async listChildDocsHandler(notebookId: string, path: string, event: MouseEvent) {
        // 阻止事件其他行为
        event.stopPropagation();
        event.preventDefault();

        // log
        logger.logDebug(`打开子文档菜单：notebookId=${notebookId}, path=${path}`);

        // 获取信息
        const i18n = getPluginInstance().i18n;

        // 计算位置
        // 当前元素（面包屑箭头）的位置信息
        const currentTarget = event.currentTarget as HTMLElement;
        const rect = currentTarget.getBoundingClientRect();
        // 计算菜单最大宽度 = 相邻文档元素最右侧位置 - 面包屑箭头左侧位置
        const nextTarget = currentTarget.parentElement.nextElementSibling; // 获取“相邻文档”元素
        const rectNext = nextTarget.getBoundingClientRect();
        const menuMaxWidth = rectNext.right - rect.left;

        // 获取子文档
        const childDocs = await getChildDocs(notebookId, path);

        // 构建菜单
        const menu = new Menu();
        // 设置菜单项文本最大宽度
        // const itemStyle = `display: inline-block; max-width: ${menuMaxWidth - Number(CONSTANTS.STYLE_CHILDDOCSMENUITEM_MAXWIDTH_DELTA)}px; overflow: clip; text-overflow: ellipsis;`;
        // 不设置文本项最大宽度
        const itemStyle = "";

        // 新建文档项目
        menu.addItem({
            icon: "iconAdd",
            label: `<span title="${i18n.createDoc}" style="${itemStyle}">${i18n.createDoc}</span>`,
            click: (element, event) => {
                createDocHandler(notebookId, path, event);
            }
        })

        // 对每个子文档构建菜单项目
        for (let i = 0; i < childDocs.length; i++) {
            const childDoc = childDocs[i];
            menu.addItem({
                icon: "iconFile",
                label: `<span title="${childDoc.name}" style="${itemStyle}">${childDoc.name}</span>`,
                click: (element, event) => {
                    openDocHandler(childDoc.id, event);
                }
            })
        }


        // 设置菜单属性
        const menuElement = menu.element as HTMLElement;
        if (menuElement) {
            // menuElement.style.maxWidth = CONSTANTS.STYLE_CHILDDOCSMENU_MAXWIDTH;
            menuElement.style.maxWidth = `${menuMaxWidth}px`;
        }

        // 设置打开菜单的位置：菜单左上角=面包屑箭头的左下角
        menu.open({
            x: rect.left, y: rect.bottom,
        })

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
            id: null,
            name: null,
            innerHTML: "",
            iconName: "#iconFile",
            isClickable: false,
            naOpacity: "0",
        })
        // 容器加入假元素、上一篇、下一篇
        div.append(elemShaddow, elemPrev, elemNext);
        return div;
    }

    createAdjacentItem(id: string, name: string , type: "prev" | "next"): HTMLElement {
        const i18n = getPluginInstance().i18n;
        const elem = createItem({
            id,
            name,
            innerHTML: type === "prev" ? i18n.adjDocPrev : i18n.adjDocNext,
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
        id,
        name,
        innerHTML,
        iconName,
        isClickable,
        maxWidth,
        naOpacity,
    }: {
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
        elem.addEventListener("click", openDocHandler.bind(null, id));
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



