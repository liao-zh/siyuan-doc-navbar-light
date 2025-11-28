import {
    getAllEditor,
    fetchPost,
} from "siyuan";
import { request, getHPathByID, getNotebookConf } from "@/utils/api"
import { getPluginInstance } from "@/utils/pluginInstance";
import { logLog } from "@/utils/logger";
// 各种局部测试

// eventbus
export function testEventbus() {
    const plugin = getPluginInstance();

    // switch-protyle：返回protyle
    plugin.eventBus.on("switch-protyle", (event) => {
        logLog("switch-protyle", event);
        // logLog("switch-protyle", event.detail.protyle.id);
    });

    // loaded-protyle-static：返回protyle
    plugin.eventBus.on("loaded-protyle-static", (event) => {
        logLog("loaded-protyle-static", event);
        // logLog("loaded-protyle-static", event.detail.protyle.id);
    });

    // ws-main：背景，不返回protyle
    plugin.eventBus.on("ws-main", (event) => {
        logLog("ws-main", event);
    });
}

// editor
export function testEditor() {
    const plugin = getPluginInstance();

    // getAllEditor：返回所有protyle，包括所有页签，包括分屏的，但”移到新窗口“后的不返回
    plugin.eventBus.on("switch-protyle", (event) => {
        logLog("getAllEditor", getAllEditor());
    });
}

// protyle
export function testProtyle() {
    const plugin = getPluginInstance();

    plugin.eventBus.on("switch-protyle", (event) => {
        const protyle = event.detail.protyle;
        logLog("protyle", protyle);
        logLog("protyle.id", protyle.id);
        logLog("protyle.notebookId", protyle.notebookId);
        logLog("protyle.path", protyle.path);
    });
}

// doc path
export function testHPath() {
    const plugin = getPluginInstance();

    // getHPathByID：返回文档的路径
    plugin.eventBus.on("switch-protyle", (event) => {
        const docId = event.detail.protyle.block.rootID;
        logLog("getHPathByID-id", docId);
        fetchPost(
            "/api/filetree/getHPathByID",
            {
                id: docId,
            },
            (response) => {
                logLog("getHPathByID-data", response.data); // 文档可读路径
            }
        );
    });

    // getNotebookConf：返回笔记本的配置
    plugin.eventBus.on("switch-protyle", (event) => {
        const boxId = event.detail.protyle.notebookId;
        logLog("getNotebookConf-id", boxId);
        fetchPost(
            "/api/notebook/getNotebookConf",
            {
                notebook: boxId,
            },
            (response) => {
                logLog("getNotebookConf-data", response.data.conf);
                logLog("getNotebookConf-data-name", response.data.conf.name); // 笔记本名字
            }
        );
    });
}

// doc path 2
export function testHPath2() {
    const plugin = getPluginInstance();

    // getHPathByID：返回文档的路径
    plugin.eventBus.on("switch-protyle", (event) => {
        const docId = event.detail.protyle.block.rootID;
        logLog("getHPathByID-id", docId);
        getHPathByID(docId).then(res => {
            logLog("getHPathByID-data", res);
        });
    });

    // getNotebookConf：返回笔记本的配置
    plugin.eventBus.on("switch-protyle", (event) => {
        const boxId = event.detail.protyle.notebookId;
        logLog("getNotebookConf-id", boxId);
        getNotebookConf(boxId).then(res => {
            logLog("getNotebookConf-data", res.conf.name);
        });
    });
}

// list docs
export function testListDocs() {
    const plugin = getPluginInstance();

    // 返回按文档树排序的文档列表
    plugin.eventBus.on("switch-protyle", (event) => {
        const protyle = event.detail.protyle;
        fetchPost(
            "/api/filetree/listDocsByPath",
            {
                notebook: protyle.notebookId,
                path: protyle.path,
            },
            (response) => {
                logLog("listDocsByPath", response.data);
            }
        );
    });
}

// 查找同级相邻的文档
export function testListDocs2() {
    const plugin = getPluginInstance();

    // 返回按文档树排序的文档列表
    plugin.eventBus.on("switch-protyle", (event) => {
        const protyle = event.detail.protyle;
        // 得到父级的路径
        const parts = protyle.path.split('/');
        let parent;
        parts.pop();
        if (parts.length > 1) {
            parent = parts.join("/") + ".sy"
        } else {
            parent = "/"
        }
        logLog("listDocsByPath-parent", parent);

        // 列出同级文档,查找相邻文档
        request(
            "/api/filetree/listDocsByPath",
            {
                notebook: protyle.notebookId,
                path: parent,
            }
        ).then(res => {
            logLog("listDocsByPath-data", res);
            // 查找相邻
            const index = res.files.findIndex(item => item.id === protyle.block.rootID);
            const filePrev = index > 0 ? res.files[index-1].name : null;
            const fileNext = index < res.files.length - 1 ? res.files[index + 1].name : null;
            logLog("listDocsByPath-filePrev", filePrev);
            logLog("listDocsByPath-fileNext", fileNext);
        });
    });
}