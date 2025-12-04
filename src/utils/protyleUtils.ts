import { type IProtyle } from "siyuan";
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
    docId: string;
    notebookId: string;
    notebookName: string;
    path: string;
    hpath: string;
}

/**
 * 从protyle中获取所需信息
 * @param protyle - protyle对象
 * @returns {IProtyleInfo} - protyle信息
 */
export async function getProtyleInfo(protyle: IProtyle): Promise < IProtyleInfo > {
    // 基本信息
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

    // 信息整合
    const result: IProtyleInfo = {
        docId,
        notebookId,
        notebookName,
        path,
        hpath,
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

    // 提取子文档的名字和ID
    const childDocs: IChildDoc[] = data.files.map(item => ({
        name: item.name.replace(/\.sy$/, ''),
        id: item.id,
    }));
    return childDocs
}