
# 思源笔记-简单面包屑插件

作者：Liao-ZH

Gitee仓库：[plugin-doc-breadcrumb-light](https://gitee.com/liao-zh/plugin-doc-breadcrumb-light)

[English Readme](./README.md)

[更新历史](./CHANGELOG.md)

## 简介

本插件为思源笔记添加了一个简单便捷的文档面包屑，保持显示在已有的块面包屑的上方。可跳转上一篇/下一篇，列出子文档，新建文档。

## 如何安装

文件准备：下载本repo，解压package.zip，重命名为`plugin-doc-breadcrumb-light`，移动到`工作空间/data/plugins/`目录下。

启用插件：在思源笔记中，点击`设置->集市->插件`，找到`简单面包屑（plugin-doc-breadcrumb-light）`，点击`启用`。

## 功能说明

显示：在块面包屑上方显示当前文档的路径（文档面包屑），以及相邻文档（上一篇/下一篇）。相邻文档的顺序与文档树中的顺序相同。

打开文档：单击面包屑中的各层级，或者上一篇/下一篇，可以打开对应的文档。Alt+单击时在右侧新页签打开，Ctrl+单击时在后台打开，二者可同时使用。

预览文档：光标悬停在文本处时，显示对应的全名。悬停在图标处时，显示文档预览。

子文档：单击面包屑层级间的箭头，显示箭头左侧层级的子文档的列表，单击可跳转，支持Alt/Ctrl+单击。

新建文档：单击面包屑层级间的箭头，在与列出文档的同层级新建文档，支持Alt/Ctrl+单击打开新文档。

设置：可在菜单中设置显示方式，包括相邻文档是否浮动显示，是否能够新建文档。

## 代码说明

方法：
- 监听的事件：文档加载（loaded-protyle-static），文档切换（switch-protyle），文档修改（ws-main：moveDoc，rename，removeDoc）。
- 相邻文档/子文档的查找：用了思源的API[/api/filetree/listDocsByPath](https://docs.siyuan-note.club/zh-Hans/reference/community/siyuan-sdk/kernel/api/filetree.html#listDocsByPath)，默认保持文档树中的顺序。
- 新建文档：用思源API[/api/filetree/createDocWithMd](https://docs.siyuan-note.club/zh-Hans/reference/community/siyuan-sdk/kernel/api/filetree.html#createDocWithMd)创建文档。

代码结构：（未列出的部分与插件示例相同）
```bash
src/
├── index.ts：插件入口
├── constants.ts：设置
├── worker/：用于执行主要功能
│   ├── settingManager.ts：设置管理器
│   ├── eventHandler.ts：监听事件
│   ├── taskProcessor.ts：处理事件触发的任务
│   ├── contentRenderer.ts：对于每个任务，渲染面包屑内容
├── utils/：提供工具
│   ├── api.ts：思源API的封装（来自模板）
│   ├── pluginInstance.ts：插件实例的管理工具
│   ├── DOMUtils.ts：处理DOM的工具
│   ├── docUtils.ts：处理文档的工具
│   ├── logger.ts：日志工具
```

## 问题

支持的平台：暂时不支持移动端。

功能：
- 新建文档：思源API新建文档用的是hpath，如果开始几个层级的名字相同，看上去会在顺序在前的路径下创建，而不一定在当前路径下。在编辑锁定状态下也能新建。新建的文档删除时思源右上角会报警告。

外观：
- 使用集市中或自定义的外观时，如果改变了块面包屑样式，可能会对文档面包屑造成意想不到的改变。

性能：
- 如果移动文档树，可能会触发大量moveDoc事件，导致插件大量的查找和更新操作。如果速度慢，可以先把所有文档关闭。


## 参考

本插件的架构基于插件示例[plugin-sample-vite-svelte](https://github.com/siyuan-note/plugin-sample-vite-svelte)。在总体思路、逻辑和很多具体实现上参考了OpaqueGlass的[文档导航插件](https://github.com/OpaqueGlass/syplugin-hierarchyNavigate)和[面包屑插件](https://github.com/OpaqueGlass/syplugin-fakeDocBreadcrumb)。
