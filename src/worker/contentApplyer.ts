// 制作和插入面包屑

import { type IProtyle } from "siyuan";
import { getHPathByID, getNotebookConf } from "@/utils/api"
import { CONSTANTS } from "@/constants";
import { logLog, logDebug } from "@/utils/logger";

export default class ContentApplyer {

    constructor() {
    }

    async apply(protyle: IProtyle) {
        // 检查是否已经插入

        // 构建容器
        let container = document.createElement("div");
        container.id = "doc-breadcrumb-container";
        container.classList.add("protyle-breadcrumb", CONSTANTS.CLASS_CONTAINER);

        const docId = protyle.block.rootID;
        const boxId = protyle.notebookId;
        const hPath = await getHPathByID(docId);
        const boxConf = await getNotebookConf(boxId);
        const boxName = boxConf.conf.name;

        let elem_breadcrumb = document.createElement("span");
        elem_breadcrumb.classList.add("protyle-breadcrumb__item", CONSTANTS.CLASS_BREADCRUMB);
        elem_breadcrumb.innerHTML = `${boxName}${hPath}`;
        container.appendChild(elem_breadcrumb);

        protyle.element.querySelectorAll(`.${CONSTANTS.CLASS_CONTAINER}`).forEach(elem => {
            elem.remove();
        });
        protyle.element.querySelector(".protyle-breadcrumb").insertAdjacentElement("beforebegin", container);

        // 构建面包屑

        // 构建相邻文档

    }

    createBreadcrumb() {

    }

    createNeighbor() {

    }
}