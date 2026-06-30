
# 思源笔记-简易文档导航条插件

作者：liao-zh

链接：[GitHub仓库](https://github.com/liao-zh/siyuan-doc-navbar-light)，[Gitee仓库](https://gitee.com/liao_zh/siyuan-doc-navbar-light)

## 缘起

思源集市已经有了一些好用的导航插件，如[文档层级导航](https://github.com/OpaqueGlass/syplugin-hierarchyNavigate)，[(伪)文档面包屑](https://github.com/OpaqueGlass/syplugin-fakeDocBreadcrumb)，[文档上下文](https://github.com/frostime/sy-doc-context)，不过各人需求不同，我在使用中发现自己需要的是这些插件功能的结合体与简化体，于是有了这个插件。

本插件在块面包屑上方添加了一个导航条，导航条中显示文档面包屑，并且可以跳转相邻文档、各层级文档和子文档。

显示在块面包屑上方，可以保持导航条一直显示。跳转相邻文档，便于查看日记等有顺序的文档树。对本文档的子文档和路径中各层级的子文档的显示逻辑进行了统一。

## 功能说明

显示：在块面包屑上方显示当前文档的路径（文档面包屑），以及相邻文档按钮（上一篇/下一篇）。相邻文档的顺序与文档树中的顺序相同。

打开文档：单击面包屑中的各层级，或者上一篇/下一篇，可以打开对应的文档。Alt+单击时在右侧新页签打开，Ctrl+单击时在后台打开，二者可同时使用。

预览文档：光标悬停在文本处时，显示对应的全名。悬停在图标处时，显示文档预览。

子文档：单击面包屑层级间的箭头，显示箭头左侧层级的子文档的列表，单击可跳转，支持Alt/Ctrl+单击。

新建文档：单击面包屑层级间的箭头，在与列出文档相同的层级新建文档，支持Alt/Ctrl+单击打开新文档。

设置：可在菜单中设置显示方式，包括相邻文档是否浮动显示，是否显示新建文档按钮。

## 主题适配

一些主题可能需要添加css片段来适配。

方法：思源设置->外观->代码片段设置->css->添加css，标题可以自定义（如“简易文档导航条插件：适配主题”），在代码片段里添加css代码，点击启用和确定。

```css
/*
  Savor主题
  style/module/breadcrumb.css里单独设置了not(last-child)的样式，这里让所有child样式统一
*/
[data-light-theme=Savor], [data-dark-theme=Savor]  {
  .protyle-breadcrumb, .protyle-breadcrumb__bar {
    .protyle-breadcrumb__item:last-child{
  		opacity: 0.6;
  		transition: opacity 300ms linear;
  	}
    &:hover .protyle-breadcrumb__item:last-child {
  		transition: opacity 300ms linear;
  		opacity: 1;
  	}
  }
}
```

## 版本更新

完整更新历史参见：[CHANGELOG](https://github.com/liao-zh/siyuan-doc-navbar-light/blob/main/CHANGELOG.md)（需要网络能访问github）。

主要和近期更新历史：
- 0.5.x：完善了基本功能，包括文档面包屑、相邻文档、子文档、新建文档、设置项
- 0.6.x：上架集市
- 0.7.x：适配思源v3.7.0

存在的问题：
- 平台：不支持移动端
- 新建文档：在编辑锁定状态下也能新建
- 外观：使用集市中或自定义的外观时，如果改变了块面包屑样式，可能会对文档面包屑造成改变


## 致谢

[plugin-sample-vite-svelte](https://github.com/siyuan-note/plugin-sample-vite-svelte)：插件模板，本插件基于此模板开发

[(伪)面包屑插件](https://github.com/OpaqueGlass/syplugin-fakeDocBreadcrumb)：参考了基本的布局

[文档导航插件](https://github.com/OpaqueGlass/syplugin-hierarchyNavigate)：参考了代码架构和功能实现


## 代码说明

方法：
- 监听的事件：文档加载（loaded-protyle-static），文档切换（switch-protyle），文档修改（ws-main：moveDoc，rename，removeDoc，create）
- 渲染导航条：用了snabbdom虚拟DOM，只在DOM变化时渲染，提高了性能，减少更新时界面的闪烁
- 相邻文档/子文档的查找：用了思源的API[/api/filetree/listDocsByPath](https://docs.siyuan-note.club/zh-Hans/reference/community/siyuan-sdk/kernel/api/filetree.html#listDocsByPath)，默认保持文档树中的顺序
- 新建文档：用思源API[/api/filetree/createDocWithMd](https://docs.siyuan-note.club/zh-Hans/reference/community/siyuan-sdk/kernel/api/filetree.html#createDocWithMd)创建文档，传入可读路径，同时传入parentID参数以确保存在同名可读路径时，实际的路径唯一

代码结构：（未列出的部分与插件示例相同）
```bash
src/
├── index.ts：插件入口
├── constants.ts：设置
├── worker/：用于执行主要功能
│   ├── settingManager.ts：设置管理器
│   ├── eventHandler.ts：监听事件
│   ├── taskProcessor.ts：处理事件触发的任务
│   ├── contentRenderer.ts：对于每个任务，渲染导航条内容
├── utils/：提供工具
│   ├── api.ts：思源API的封装（来自模板）
│   ├── pluginInstance.ts：插件实例的管理工具
│   ├── DOMUtils.ts：处理DOM的工具
│   ├── docUtils.ts：处理文档的工具
│   ├── logger.ts：日志工具
```

手动安装插件：
- 下载并解压package.zip，重命名为`siyuan-inbox-transfer`，移动到`<思源工作空间>/data/plugins/`目录下
- 在思源笔记中，点击`设置->集市->已下载->插件`，找到`收集箱中转站（siyuan-inbox-transfer）`，点击`启用`
