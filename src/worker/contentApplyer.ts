// 制作和插入面包屑

import { type IProtyle } from "siyuan";
import { getHPathByID, getNotebookConf } from "@/utils/api"
import { CONSTANTS } from "@/constants";
import { logLog, logDebug } from "@/utils/logger";


// 从protyle中提取所需属性
interface IProtyleInfo {
    docId: string;
    notebookId: string;
    notebook: string;
    path: string;
    hpath: string;
    pathItems: string[];
    hpathItems: string[];
}

async function parseProtyle(protyle: IProtyle): Promise < IProtyleInfo > {
    // ids
    const docId = protyle.block.rootID;
    const notebookId = protyle.notebookId;

    // requests
    const [notebookConf, hpath] = await Promise.all([
        getNotebookConf(notebookId),
        getHPathByID(docId)
    ]);

    // notebook
    const notebook = notebookConf.conf.name;

    // paths
    const path = protyle.path;
    const pathItems = path.replace(/\.sy$/, '').split("/").slice(1);
    const hpathItems = hpath.split("/").slice(1);

    // combination
    const result: IProtyleInfo = {
        docId,
        notebookId,
        path,
        hpath,
        notebook,
        pathItems,
        hpathItems,
    }
    return result
}

export class ContentApplyer {

    constructor() {
    }

    async apply(protyle: IProtyle, replace: boolean = false) {
        // 检查是否已经插入元素
        // 如果已经插入且replace，则移除已插入元素
        const existContainer = protyle.element.querySelector(`.${CONSTANTS.CLASS_CONTAINER}`);
        if (existContainer) {
            if (replace) {
                protyle.element.querySelectorAll(`.${CONSTANTS.CLASS_CONTAINER}`).forEach(elem => {
                    elem.remove();
                });
            } else {
                return;
            }
        }

        // 解析protyle
        const protyleInfo = await parseProtyle(protyle);

        logLog("protyleInfo", protyleInfo);

        // 构建容器
        let div = document.createElement("div");
        div.classList.add("protyle-breadcrumb", CONSTANTS.CLASS_CONTAINER);

        // 构建面包屑
        div.appendChild(this.createBreadcrumb(protyleInfo));

        // 构建相邻文档

        // 插入容器
        protyle.element.querySelector(".protyle-breadcrumb").insertAdjacentElement("beforebegin", div);
    }

    // 构建文档面包屑HTML元素
    createBreadcrumb(protyleInfo: IProtyleInfo): HTMLElement {
        // 创建容器
        let div = document.createElement("div");
        div.classList.add("protyle-breadcrumb__bar", "protyle-breadcrumb__bar--nowrap");

        // 添加笔记本
        div.appendChild(
            this.createBreadcrumbItem(protyleInfo.docId, protyleInfo.notebook, "#iconFolder", false)
        );

        // 添加箭头和路径上的文档
        for (let i = 0; i < protyleInfo.pathItems.length; i++) {
            div.appendChild(this.createBreadcrumbArrow());
            div.appendChild(
                this.createBreadcrumbItem(protyleInfo.pathItems[i], protyleInfo.hpathItems[i], "#iconFile", true)
            )
        }

        return div;
    }

    // 构建文档面包屑HTML元素中的每个层级
    createBreadcrumbItem(id: string, name: string, icon: string, isFile: boolean = true): HTMLElement {
        // 命名空间
        const nsSvg = "http://www.w3.org/2000/svg";
        const nsXlink = "http://www.w3.org/1999/xlink";

        // 构建容器
        let elem = document.createElement("span");
        elem.classList.add("protyle-breadcrumb__item");

        // 构建xvg和xlink
        let svg = document.createElementNS(nsSvg, "svg");
        svg.classList.add("popover__block");
        let xlink = document.createElementNS(nsSvg, "use");
        xlink.setAttributeNS(nsXlink, "xlink:href", icon);

        // 如果是文档而非笔记本，添加id
        if (isFile) {
            elem.dataset.nodeId = id;
            svg.dataset.id = id;
        }

        // 添加元素
        svg.appendChild(xlink);
        elem.appendChild(svg);

        // 构建文本元素
        let text = document.createElement("span");
        text.classList.add("protyle-breadcrumb__text");
        text.title = name;
        text.innerHTML = name;
        elem.appendChild(text);

        return elem;
    }

    // 构建面包屑层级之间的箭头
    createBreadcrumbArrow() {
        // 命名空间
        const nsSvg = "http://www.w3.org/2000/svg";
        const nsXlink = "http://www.w3.org/1999/xlink";

        // 构建svg和xlink
        let svg = document.createElementNS(nsSvg, "svg");
        svg.classList.add("protyle-breadcrumb__arrow");
        let xlink = document.createElementNS(nsSvg, "use");
        xlink.setAttributeNS(nsXlink, "xlink:href", "#iconRight");
        svg.appendChild(xlink);
        return svg;
    }

    createNeighbor() {

    }
}