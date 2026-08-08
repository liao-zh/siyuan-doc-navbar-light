import { type IProtyle, openTab } from "siyuan";
import { getPluginInstance } from "@/utils/pluginInstance";
import * as logger from "@/utils/logger";
import { request, getHPathByID, getNotebookConf } from "@/utils/api"

/**
 * protyle信息接口
 * @property {string} docId - 文档ID
 * @property {string} notebookId - 笔记本ID
 * @property {string} notebookName - 笔记本名称
 * @property {string} path - 文档路径
 * @property {string} hpath - 文档可读路径
 */
export interface IProtyleInfo {
    id: string;
    docId: string;
    notebookId: string;
    notebookName: string;
    path: string;
    hpath: string;
    rect: DOMRect;
}

/**
 * 从protyle中获取所需信息
 * @param protyle - protyle对象
 * @returns {IProtyleInfo} - protyle信息
 */
export async function getProtyleInfo(protyle: IProtyle): Promise < IProtyleInfo > {
    // 基本信息
    const id = protyle.id;
    const docId = protyle.block.rootID;
    const notebookId = protyle.notebookId;
    const path = protyle.path;

    // 异步调用API获取信息
    const [notebookConf, hpath] = await Promise.all([
        getNotebookConf(notebookId),
        getHPathByID(docId),
    ]);

    // 笔记本
    const notebookName = notebookConf.conf.name;

    // 窗口
    const rect = protyle.element.getBoundingClientRect();

    // 信息整合
    const result: IProtyleInfo = {
        id,
        docId,
        notebookId,
        notebookName,
        path,
        hpath,
        rect,
    }
    return result
}

/** 相邻文档接口
 * @property {string | null} prevId - 前一个文档ID
 * @property {string | null} prevName - 前一个文档名称
 * @property {string | null} nextId - 后一个文档ID
 * @property {string | null} nextName - 后一个文档名称
 */
export interface IAdjacentDocs {
    prevId: string | null;
    prevName: string | null;
    nextId: string | null;
    nextName: string | null;
}

/**
 * 相邻文档获取
 * @param docId - 当前文档ID
 * @param notebookId - 笔记本ID
 * @param path - 当前文档路径
 * @returns {IAdjacentDocs} - 相邻文档的名字和ID
 */
export async function getAdjacentDocs(docId: string, notebookId: string, path: string): Promise<IAdjacentDocs> {
    // 得到父级的路径
    const pathParts = path.split('/');
    pathParts.pop();
    const pathParent = (pathParts.length > 1) ? pathParts.join("/") + ".sy" : "/";

    // 列出同级文档：父级文档的子文档，默认按照文档树顺序
    const data = await request(
        "/api/filetree/listDocsByPath",
        {
            notebook: notebookId,
            path: pathParent,
        }
    )

    // 查找相邻文档
    const index = data.files.findIndex(item => item.id === docId);
    const prevName = index > 0 ? data.files[index - 1].name.replace(/\.sy$/, '') : null;
    const prevId = index > 0 ? data.files[index - 1].id : null;
    const nextName = index < data.files.length - 1 ? data.files[index + 1].name.replace(/\.sy$/, '') : null;
    const nextId = index < data.files.length - 1 ? data.files[index + 1].id : null;

    // 信息整合
    const result = { prevName, prevId, nextName, nextId };
    return result
}

/**
 * 子文档接口
 * @property {string} name - 子文档名称
 * @property {string} id - 子文档ID
 */
export interface IChildDoc {
    name: string;
    id: string;
}

/**
 * 子文档获取
 * @param notebookId - 笔记本ID
 * @param path - 当前文档路径
 * @returns {IChildDoc[]} - 子文档的名字和ID列表
 */
export async function getChildDocs(notebookId: string, path: string): Promise<IChildDoc[]> {
    // 列出子文档：默认按照文档树顺序
    const data = await request(
        "/api/filetree/listDocsByPath",
        {
            notebook: notebookId,
            path: path,
        }
    );

    // 检查是否成功获取子文档
    if (data === null) {
        logger.logWarn(`获取子文档失败：notebookId=${notebookId}, path=${path}`);
        return [];
    }

    // 提取子文档的名字和ID
    const childDocs: IChildDoc[] = data.files.map(item => ({
        name: item.name.replace(/\.sy$/, ''),
        id: item.id,
    }));
    return childDocs
}


/**
 * 聚焦导航条所在窗格的编辑器内容
 * @description 思源通过编辑器内容区的 focusin 事件（setPanelFocus）更新活动窗格（layout__wnd--active），
 * 而导航条位于面包屑区域（wysiwyg 之外），点击不会触发 focusin，
 * 导致分屏时文档在焦点窗格而非被点击导航条所在窗格打开。
 * 此处对目标窗格 wysiwyg 调用真实 focus()，由浏览器原生触发 focusin，
 * 复用思源自身的激活逻辑；原生事件派发时监听器异常不会阻断后续代码。
 * @param protyleElement - 导航条所在的 protyle 元素
 */
function focusProtyleWindow(protyleElement: HTMLElement | null) {
    // 仅处理真实 DOM 元素；snabbdom 事件处理器会额外传入 vnode 等对象，
    // 无法定位到 protyle（如浮窗内的导航条）时跳过，沿用思源默认行为
    if (!(protyleElement instanceof HTMLElement)) {
        return;
    }
    const wndElement = protyleElement.closest('[data-type="wnd"]') as HTMLElement | null;
    // 不在窗格内或已是活动窗格时不处理
    if (!wndElement || wndElement.classList.contains("layout__wnd--active")) {
        return;
    }
    // 桌面端 .protyle-wysiwyg 本身 contenteditable="true"，聚焦即触发思源 focusin 监听器
    try {
        const wysiwygElement = protyleElement.querySelector(".protyle-wysiwyg") as HTMLElement | null;
        wysiwygElement?.focus({ preventScroll: true });
    } catch (e) {
        logger.logWarn(`聚焦导航条所在窗格失败：${e}`);
    }
}

/**
 * 点击事件：打开文档
 * @param docId - 文档id
 * @param event - 鼠标事件
 * @param protyleElement - 导航条所在的 protyle 元素（菜单项点击时显式传入，其余情况自动推导）
 */
export function openDocHandler(docId: string, event: MouseEvent, protyleElement?: HTMLElement) {
    // 阻止事件其他行为
    event.stopPropagation();
    event.preventDefault();

    // log
    // logger.logDebug(`打开文档：docId=${docId}`);

    // 分屏时先聚焦被点击导航条所在窗格，使文档在该窗格打开
    // 第三个参数仅在菜单项场景显式传入；直接点击场景会被 snabbdom 传入 vnode，需按 DOM 元素推导
    focusProtyleWindow(protyleElement instanceof HTMLElement ? protyleElement : ((event.currentTarget as HTMLElement)?.closest(".protyle") as HTMLElement));

    // 打开新标签页
    openTab({
        app: getPluginInstance().app,
        doc: {
            id: docId,
        },
        // 条件属性：只有在按下辅助按键时才添加position属性
        // 如果多个键同时按下，后面属性覆盖前面
        ...(event.altKey && { position: "right" }), // alt+单击时，在右侧打开页签
        // ...(e.shiftKey && { position: "bottom" }),
        keepCursor: event.ctrlKey ? true : false, // ctrl+单击时，在后台打开页签
    });
}

/**
 * 点击事件：新建文档并打开
 * @param notebookId - 笔记本id
 * @param path - 文档路径
 * @param event - 鼠标事件
 * @param protyleElement - 导航条所在的 protyle 元素（菜单项点击时显式传入）
 * @issue 用思源API创建文档时，如果hpath开始几个层级相同，看上去会在顺序在前的路径下创建
 */
export async function createDocHandler(notebookId: string, path: string, event: MouseEvent, protyleElement?: HTMLElement) {
    // 阻止事件其他行为
    event.stopPropagation();
    event.preventDefault();


    // 新文档名称
    const leaf = `/${getPluginInstance().i18n.newDocTitle}`;
    // 从path计算hpath，用parentID区分同名的hpath
    let hpath: string;
    let parentID: string;
    if (path === "/") {
        hpath = leaf;
        parentID = "";
    } else {
        const pathItems = path.split("/");
        parentID = pathItems[pathItems.length - 1].replace(/\.sy$/, '');
        hpath = await getHPathByID(parentID);
        hpath = hpath + leaf;
    }

    // log
    // logger.logDebug(`新建文档：notebookId=${notebookId}, hpath=${hpath}, parentID=${parentID}`);

    // 新建文档
    const docId = await request(
        '/api/filetree/createDocWithMd',
        {
            notebook: notebookId,
            path: hpath,
            parentID: parentID,
            markdown: "",
        }
    );
    if (docId === null) {
        logger.logWarn(`新建文档失败：notebookId=${notebookId}, hpath=${hpath}, parentID=${parentID}`);
    } else {
        // 打开文档
        openDocHandler(docId, event, protyleElement);
    }
}