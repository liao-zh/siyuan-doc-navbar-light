// 制作和插入面包屑

import { type IProtyle, Menu, getAllEditor } from "siyuan";
import { CONSTANTS } from "@/constants";
import { getPluginInstance } from "@/utils/pluginInstance";
import * as logger from "@/utils/logger";
import { selectInjectedInProtyle } from "@/utils/DOMUtils";
import { type IProtyleInfo, getProtyleInfo, getAdjacentDocs, getChildDocs, openDocHandler, createDocHandler } from "@/utils/docUtils";
import { init, h, VNode } from "snabbdom";
import { classModule, attributesModule, datasetModule, styleModule, eventListenersModule } from "snabbdom";


/**
 * 内容渲染器
*/
export class ContentRenderer {
    private plugin = getPluginInstance();
    // 初始化patch
    private patch = init([classModule, attributesModule, datasetModule, styleModule, eventListenersModule]);
    // 初始化vnode缓存：{protyle.id: vnode}
    private vnodesCache = new Map();

    /**
     * 清空所有vnode缓存
     */
    clearAllCache(): void {
        this.vnodesCache.clear();
    }

    /**
     * 清除不活跃的vnode缓存
     */
    clearInactiveCache(): void {
        // 获取所有protyle的id
        const allEditor = getAllEditor();
        const activeIds = new Set(allEditor.map(editor => editor.protyle.id));

        // 遍历缓存，删除不活跃的vnode
        const idsToDelete: string[] = [];
        this.vnodesCache.forEach((_, id) => {
            if ( !activeIds.has(id) ) {
                idsToDelete.push(id);
            }
        });
        idsToDelete.forEach(id => this.vnodesCache.delete(id));
    }

    /**
     * 对给定protyle更新整个面包屑栏
     * DOM：面包屑-空格-相邻文档
     * @param protyle 要更新面包屑的protyle
     */
    async update(protyle: IProtyle) {
        // 判断是否存在块面包屑
        const blockBreadcrumb = protyle.element.querySelector(".protyle-breadcrumb");
        if (!blockBreadcrumb) {
            logger.logDebug("插入元素：不存在块面包屑，退出");
            return;
        }

        // 选择插入的容器
        let container = selectInjectedInProtyle(protyle);
        // 如果没有容器则创建一个，插入块面包屑之前
        if ( container === null ) {
            container = document.createElement("div");
            blockBreadcrumb.insertAdjacentElement("beforebegin", container);
        }

        // 获取protyle信息
        const protyleInfo = await getProtyleInfo(protyle);
        logger.logDebug("插入元素：protyle信息", protyleInfo);
        logger.logDebug("插入元素：vnode缓存", Array.from(this.vnodesCache.keys()));

        // 构建vnode
        const vnodeNew = await this.renderProtyle(protyleInfo);

        // patch更新DOM
        const vnodeRec = this.vnodesCache.get(protyleInfo.id);
        let vnodePatch: VNode;
        // 如果缓存中不存在vnode，则直接patch
        if ( !vnodeRec ) {
            vnodePatch = this.patch(container, vnodeNew);
            // 如果缓存中存在vnode，则patch更新
        } else {
            vnodePatch = this.patch(vnodeRec, vnodeNew);
        }
        this.vnodesCache.set(protyleInfo.id, vnodePatch);

        // 清理vnode缓存
        this.clearInactiveCache();
    }

    /**
     * 构建整个面包屑栏
     * @param protyleInfo - protyle信息
     * @returns {VNode} - 面包屑栏vnode
     */
    async renderProtyle(protyleInfo: IProtyleInfo): Promise<VNode> {
        // 构建面包屑栏的元素：面包屑部分，空格，相邻文档
        const breadcrumbVNode = this.createBreadcrumb(protyleInfo);
        const spaceVNode = this.createSpace();
        const adjVNode = await this.createAdjacent(protyleInfo);

        // 排列面包屑栏的元素：根据是否要把相邻文档固定在右侧分别排列
        let fullChildren: VNode[];
        if ( this.plugin.settingManager.get("pinAdjacentRight") ) {
            fullChildren = [breadcrumbVNode, spaceVNode, adjVNode];
        } else {
            fullChildren = [breadcrumbVNode, adjVNode];
        }

        // 构建面包屑栏
        const fullAttrs = {
            attrs: {
                [CONSTANTS.CONTAINER_ATTR]: `${CONSTANTS.CONTAINER_VALUE}`,
            }
        };
        const fullVNode = h("div.protyle-breadcrumb", fullAttrs, fullChildren);
        return fullVNode;
    }

    /**
     * 构建面包屑栏空格
     * @returns {VNode} - 空格vnode
     */
    createSpace(): VNode {
        const spaceVNode = h("span.protyle-breadcrumb__space");
        return spaceVNode;
    }

    /**
     * 构建面包屑
     * DOM：div容器/{span条目/{图标-文本}，svg箭头}
     * @param protyleInfo - protyle信息
     * @returns {VNode} - 面包屑vnode
     */
    createBreadcrumb(protyleInfo: IProtyleInfo): VNode {
        // 构建子元素数组
        // 路径分段
        const pathItems = protyleInfo.path.replace(/\.sy$/, '').split("/").slice(1);
        const hpathItems = protyleInfo.hpath.split("/").slice(1);
        const children: VNode[] = [];
        // 计算菜单最大宽度
        const menuRightMax = protyleInfo.rect.right;
        // 添加笔记本
        let pathI = "/";
        children.push(
            this.createBreadcrumbItem(protyleInfo.notebookId, protyleInfo.notebookName, "notebook"),
            this.createBreadcrumbArrow(protyleInfo.notebookId, pathI, menuRightMax)
        );
        // 添加中间层级的文档
        for (let i = 0; i < pathItems.length - 1; i++) {
            pathI = "/" + pathItems.slice(0, i+1).join("/") + ".sy";
            children.push(
                this.createBreadcrumbItem(pathItems[i], hpathItems[i], "doc-middle"),
                this.createBreadcrumbArrow(protyleInfo.notebookId, pathI, menuRightMax)
            );
        }
        // 添加最后一层文档
        pathI = "/" + pathItems.join("/") + ".sy";
        children.push(
            this.createBreadcrumbItem(pathItems[pathItems.length - 1], hpathItems[hpathItems.length - 1], "doc-last"),
            this.createBreadcrumbArrow(protyleInfo.notebookId, pathI, menuRightMax)
        );

        // 构建容器
        const breadcrumbVNode = h("div.protyle-breadcrumb__bar.protyle-breadcrumb__bar--nowrap", children);

        return breadcrumbVNode;
    }

    /**
     * 构建面包屑的单个层级项
     * DOM：span容器/{图标-文本}
     * @param id - 面包屑项ID
     * @param name - 面包屑项名称
     * @param type：面包屑项类型（notebook笔记本，doc-middle中间层级文档，doc-last最后一层文档）
     * @returns {VNode} - 面包屑项vnode
     */
    createBreadcrumbItem(id: string, name: string, type: "notebook" | "doc-middle" | "doc-last"): VNode {
        const itemVNode = createItem({
            id,
            name,
            innerHTML: name,
            iconName: type === "notebook" ? "#iconFolder" : "#iconFile", // 笔记本用文件夹图标，文档用文件图标
            isClickable: type !== "notebook", // 除了笔记本，都可以点击
            maxWidth: type === "doc-middle" ? CONSTANTS.STYLE_BREADCRUMBITEM_MAXWIDTH : "none", // 对中间文档限制宽度
        })
        return itemVNode;
    }

    /**
     * 构建面包屑层级之间的箭头
     * @param notebookId - 笔记本id
     * @param path - 文档路径
     * @returns {VNode} - 面包屑箭头vnode
     */
    createBreadcrumbArrow(notebookId: string, path: string, menuRightMax: number): VNode {
        // 设置箭头属性
        const arrowAttrs = {
            style: {
                cursor: "pointer",
            },
            on: {
                click: this.listChildDocsHandler.bind(this, notebookId, path, menuRightMax),
            }
        };
        // 构建图标
        const svgVNode = createSvg("protyle-breadcrumb__arrow", "#iconRight");
        // 构建箭头
        const arrowVNode = h("span", arrowAttrs, [ svgVNode ]);
        return arrowVNode;
    }

    /**
     * 点击事件：打开子文档菜单
     * @param notebookId - 笔记本id
     * @param path - 文档路径
     * @param menuRightMax - 菜单右侧最大位置
     * @param event - 鼠标事件
     */
    async listChildDocsHandler(notebookId: string, path: string, menuRightMax: number, event: MouseEvent) {
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
        const menuMaxWidth = menuRightMax - rect.left;

        // 获取子文档
        const childDocs = await getChildDocs(notebookId, path);

        // 构建菜单
        const menu = new Menu();
        // 设置菜单项文本最大宽度
        // const itemStyle = `display: inline-block; max-width: ${menuMaxWidth - Number(CONSTANTS.STYLE_CHILDDOCSMENUITEM_MAXWIDTH_DELTA)}px; overflow: clip; text-overflow: ellipsis;`;
        // 不设置文本项最大宽度
        const itemStyle = "";

        // 新建文档项目
        // 需要考虑更周全：锁定状态不能新建；删除新建的文档时，思源会在右上角提示warning，暂时不知道是什么原因
        if ( this.plugin.settingManager.get("enableNewDoc") ) {
            menu.addItem({
                icon: "iconAdd",
                label: `<span title="${i18n.createDoc}" style="${itemStyle}">${i18n.createDoc}</span>`,
                click: (_, event) => {
                    createDocHandler(notebookId, path, event);
                }
            })
        }

        // 对每个子文档构建菜单项目
        for (let i = 0; i < childDocs.length; i++) {
            const childDoc = childDocs[i];
            menu.addItem({
                icon: "iconFile",
                label: `<span title="${childDoc.name}" style="${itemStyle}">${childDoc.name}</span>`,
                click: (_, event) => {
                    openDocHandler(childDoc.id, event);
                }
            })
        }

        // 处理没有子文档的情况
        if (childDocs.length === 0) {
            menu.addItem({
                icon: "iconInfo",
                label: `<span title="${i18n.noChildDocs}" style="opacity: ${CONSTANTS.STYLE_DISABLED_OPACITY}">${i18n.noChildDocs}</span>`,
            })
        }

        // 设置菜单属性
        const menuElement = menu.element as HTMLElement;
        if (menuElement) {
            menuElement.style.maxWidth = `${menuMaxWidth}px`;
        }

        // 设置打开菜单的位置：菜单左上角=面包屑箭头的左下角
        menu.open({
            x: rect.left, y: rect.bottom,
        })

    }

    /**
     * 构建相邻文档
     * @param protyleInfo - protyle信息
     * @returns {VNode} - 相邻文档vnode
     */
    async createAdjacent(protyleInfo: IProtyleInfo): Promise<VNode> {
        // 查找相邻文档
        const adjDocs = await getAdjacentDocs(protyleInfo.docId, protyleInfo.notebookId, protyleInfo.path);

        // 构建上一篇和下一篇
        const prevVNode = this.createAdjacentItem(adjDocs.prevId, adjDocs.prevName, "prev");
        const nextVNode = this.createAdjacentItem(adjDocs.nextId, adjDocs.nextName, "next");

        // 构建假元素，应对有些外观样式（如Savor）会将第一个元素的图标改掉
        const shaddowVNode = createItem({
            id: null,
            name: null,
            innerHTML: "",
            iconName: "#iconFile",
            isClickable: false,
            naOpacity: "0",
        })

        // 构建相邻元素：[假元素，上一篇，下一篇]
        const adjAttrs = {
            style: {
                minWidth: CONSTANTS.STYLE_ADJACENT_MINWIDTH,
            }
        }
        const adjVNode = h("div.protyle-breadcrumb__bar.protyle-breadcrumb__bar--nowrap", adjAttrs,
            [shaddowVNode, prevVNode, nextVNode]
        )
        return adjVNode;
    }

    /**
     * 构建相邻文档的一项
     * @param id - 文档ID
     * @param name - 文档名称
     * @param type - 项类型（"prev"或"next"）
     * @returns {VNode} - 相邻文档项vnode
     */
    createAdjacentItem(id: string, name: string , type: "prev" | "next"): VNode {
        const i18n = getPluginInstance().i18n;
        const itemVNode = createItem({
            id,
            name,
            innerHTML: type === "prev" ? i18n.adjDocPrev : i18n.adjDocNext,
            iconName: type === "prev" ? "#iconBack" : "#iconForward",
            isClickable: (id !== null), // 存在相邻文档时才可点击
            naOpacity: CONSTANTS.STYLE_DISABLED_OPACITY, // 不可点击时灰化
        })
        return itemVNode
    }
}

/**
 * 构建面包屑条目样式
 * DOM：span容器/{图标-文本}
 * @param id - 文档或笔记本ID
 * @param name - 文档或笔记本名称
 * @param innerHTML - 要显示的文本内容
 * @param iconName - 图标名称
 * @param isClickable - 是否可点击
 * @param app - 思源插件app
 * @param maxWidth? - 最大宽度
 * @param naOpacity? - 不可点击时的透明度
 * @returns {VNode} - 面包屑项样式的vnode
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
    }): VNode {

    // 设置item属性
    const itemAttrs = {
        style: {
            ...(maxWidth && { "max-width": maxWidth }),
            ...(!isClickable && naOpacity && { "opacity": naOpacity }),
            cursor: isClickable ? "pointer" : "default",
        },
        dataset: {
            ...(isClickable && { nodeId: id }),
        },
        on: {
            ...(isClickable && { click: openDocHandler.bind(null, id) }),
        },
    };

    // 构建图标
    const svgVNode = createSvg("popover__block", iconName, isClickable? id:undefined);

    // 构建文本
    const textAttrs = {
        attrs: {
            ...(name && { title: name })
        },
    };
    const textVNode = h("span.protyle-breadcrumb__text", textAttrs, innerHTML);

    // 构建面包屑项
    const itemVNode = h("span.protyle-breadcrumb__item", itemAttrs,
    [
        svgVNode,
        textVNode
    ]);

    return itemVNode;
}

/**
 * 构建SVG图标
 * @param className - 图标类名
 * @param iconName - 图标名称
 * @param dataId? - 图标数据ID
 * @returns {VNode} - 图标vnode
 */
function createSvg(className: string, iconName: string, dataId?: string): VNode {
    const svgAttrs = {
        dataset: {
            ...(dataId && { id: dataId })
        }
    };
    const xlinkAttrs = {
        attrs: {
            "xlink:href": iconName
        }
    };

    const svgVNode = h(`svg.${className}`, svgAttrs, [ h("use", xlinkAttrs)]);
    return svgVNode;
}



