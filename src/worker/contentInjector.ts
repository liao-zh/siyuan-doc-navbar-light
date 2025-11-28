// 制作和插入面包屑

import { App, type IProtyle, openTab, Plugin } from "siyuan";
import { request, getHPathByID, getNotebookConf } from "@/utils/api"
import { getPluginInstance } from "@/utils/pluginInstance";
import { CONSTANTS } from "@/constants";
import * as logger from "@/utils/logger";


// 从protyle中提取所需属性
interface IProtyleInfo {
    docId: string;
    notebookId: string;
    notebook: string;
    path: string;
    hpath: string;
    pathItems: string[];
    hpathItems: string[];
    docPrev: string | null;
    docNext: string | null;
}

// 获取相邻文档
async function getAdjacentDocs(docId: string, notebookId: string, path: string): Promise<{docPrev: string | null, docNext: string | null}> {
    // 得到父级的路径
    const parts = path.split('/');
    parts.pop();
    const parent = (parts.length > 1)? parts.join("/")+".sy" : "/";

    // 列出同级文档
    const data = await request(
        "/api/filetree/listDocsByPath",
        {
            notebook: notebookId,
            path: parent,
        }
    )

    // 查找相邻文档
    const index = data.files.findIndex(item => item.id === docId);
    const docPrev = index > 0 ? data.files[index-1].name : null;
    const docNext = index < data.files.length - 1 ? data.files[index + 1].name : null;

    return {docPrev, docNext};
}

// 从protyle中获取所需信息
async function parseProtyle(protyle: IProtyle): Promise < IProtyleInfo > {
    // 基本信息
    const docId = protyle.block.rootID;
    const notebookId = protyle.notebookId;
    const path = protyle.path;

    // 异步调用API获取信息
    const [notebookConf, hpath, docPrevNext] = await Promise.all([
        getNotebookConf(notebookId),
        getHPathByID(docId),
        getAdjacentDocs(docId, notebookId, path),
    ]);

    // 笔记本
    const notebook = notebookConf.conf.name;

    // 路径
    const pathItems = path.replace(/\.sy$/, '').split("/").slice(1);
    const hpathItems = hpath.split("/").slice(1);

    // 相邻文档
    const {docPrev, docNext} = docPrevNext;

    // 整合
    const result: IProtyleInfo = {
        docId,
        notebookId,
        path,
        hpath,
        notebook,
        pathItems,
        hpathItems,
        docPrev,
        docNext,
    }
    return result
}

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
        const protyleInfo = await parseProtyle(protyle);

        logger.logLog("protyleInfo", protyleInfo);

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
    createBreadcrumbItem(id: string, name: string, iconName: string, isFile: boolean = true): HTMLElement {
        // 构建容器
        let elem = document.createElement("span");
        elem.classList.add("protyle-breadcrumb__item");

        // 构建xvg和xlink
        let svg = createSvg("popover__block", iconName);
        elem.appendChild(svg);

        // 如果是文档而非笔记本，添加id
        if (isFile) {
            elem.dataset.nodeId = id;
            svg.dataset.id = id;
        }

        // 构建文本元素
        let text = document.createElement("span");
        text.classList.add("protyle-breadcrumb__text");
        text.title = name;
        text.innerHTML = name;
        elem.appendChild(text);

        // 添加点击事件
        if (isFile) {
            elem.addEventListener("click", clickHandler.bind(this, this.plugin.app, id));
        }


        return elem;
    }

    // 构建面包屑层级之间的箭头
    createBreadcrumbArrow(): SVGElement {
        return createSvg("protyle-breadcrumb__arrow", "#iconRight");
    }

    createNeighbors(protyleInfo: IProtyleInfo) {

    }

}

function createSvg(className: string, iconName: string): SVGElement {
    // 命名空间
    const nsSvg = "http://www.w3.org/2000/svg";
    const nsXlink = "http://www.w3.org/1999/xlink";

    // 构建xvg和xlink
    let svg = document.createElementNS(nsSvg, "svg");
    svg.classList.add(className);
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