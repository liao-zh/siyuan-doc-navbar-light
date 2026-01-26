# SiYuan Note - Doc NavBar Light Plugin

Author: liao-zh

Links: [GitHub Repository](https://github.com/liao-zh/siyuan-doc-navbar-light), [Gitee Repository](https://gitee.com/liao_zh/siyuan-doc-navbar-light)

## Background

There are already some useful navigation plugins in the SiYuan marketplace, such as [Document Hierarchy Navigation](https://github.com/OpaqueGlass/syplugin-hierarchyNavigate), [(Fake) Document Breadcrumb](https://github.com/OpaqueGlass/syplugin-fakeDocBreadcrumb), and [Document Context](https://github.com/frostime/sy-doc-context). However, everyone's needs are different. During use, I found that what I needed was a combination and simplification of these plugins' features, so I created this plugin.

This plugin adds a navigation bar above the block breadcrumb, which displays document breadcrumbs and allows navigation to adjacent documents, documents at different levels, and child documents.

By displaying it above the block breadcrumb, the navigation bar remains visible at all times. Navigation to adjacent documents makes it easy to view sequential document trees like journals. The display logic for subdocuments of the current document and subdocuments at each level in the path has been unified.

## Feature Description

**Display**: Shows the current document's path (document breadcrumbs) and adjacent document buttons (previous/next) above the block breadcrumb. The order of adjacent documents is the same as in the document tree.

**Open Documents**: Click on each level in the breadcrumbs, or previous/next buttons, to open the corresponding document. Alt+click to open in a new tab on the right, Ctrl+click to open in the background, and both can be used simultaneously.

**Preview Documents**: When the cursor hovers over text, the corresponding full name is displayed. When hovering over icons, document previews are shown.

**Child Documents**: Click the arrow between breadcrumb levels to display a list of subdocuments for the level on the left side of the arrow. Click to navigate, with support for Alt/Ctrl+click.

**Create New Document**: Click the arrow between breadcrumb levels to create a new document at the same level as the listed documents, with support for Alt/Ctrl+click to open the new document.

**Settings**: Settings are available in the menu to configure display options, including whether adjacent documents are displayed in a floating manner and whether to show the new document button.

## Theme Adaptation

Some themes may require adding CSS snippets for adaptation.

Method: SiYuan Settings -> Appearance -> Code Snippet Settings -> CSS -> Add CSS, the title can be customized (e.g., "Simple Document Navbar Plugin: Theme Adaptation"), add CSS code in the snippet, then click Enable and OK.

```css
/*
  Savor Theme
  style/module/breadcrumb.css sets separate styles for not(last-child), here we unify all child styles
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


## Version Updates

For the complete update history, see: [CHANGELOG](https://github.com/liao-zh/siyuan-doc-navbar-light/blob/main/CHANGELOG.md) (requires internet access to GitHub).

Major and recent update history:
- 0.5.x: Improved basic functionality, including document breadcrumbs, adjacent documents, subdocuments, new document creation, and settings
- 0.6.x: Listed in the marketplace

Known issues:
- Platform: Mobile devices are not supported
- New document creation: Can be created even in edit-locked state
- Appearance: When using marketplace or custom themes that modify block breadcrumb styles, it may affect document breadcrumbs

## Acknowledgments

[plugin-sample-vite-svelte](https://github.com/siyuan-note/plugin-sample-vite-svelte): Plugin template, this plugin was developed based on this template

[(Fake) Breadcrumb Plugin](https://github.com/OpaqueGlass/syplugin-fakeDocBreadcrumb): Referenced the basic layout

[Document Navigation Plugin](https://github.com/OpaqueGlass/syplugin-hierarchyNavigate): Referenced the code architecture and feature implementation

## Code Explanation

Methods:
- Monitored events: Document loading (loaded-protyle-static), document switching (switch-protyle), document modification (ws-main: moveDoc, rename, removeDoc, create)
- Navigation bar rendering: Used snabbdom virtual DOM, only rendering when DOM changes occur, which improves performance and reduces interface flickering during updates
- Adjacent document/subdocument lookup: Used SiYuan's API [/api/filetree/listDocsByPath](https://docs.siyuan-note.club/zh-Hans/reference/community/siyuan-sdk/kernel/api/filetree.html#listDocsByPath), which maintains the order in the document tree by default
- New document creation: Used SiYuan API [/api/filetree/createDocWithMd](https://docs.siyuan-note.club/zh-Hans/reference/community/siyuan-sdk/kernel/api/filetree.html#createDocWithMd) to create documents, passing in readable paths, and simultaneously passing the parentID parameter to ensure unique actual paths when duplicate readable paths exist

Code structure: (Unlisted parts are the same as the plugin sample)
```bash
src/
├── index.ts: Plugin entry
├── constants.ts: Settings
├── worker/: For executing main functionality
│   ├── settingManager.ts: Settings manager
│   ├── eventHandler.ts: Event listener
│   ├── taskProcessor.ts: Processes tasks triggered by events
│   ├── contentRenderer.ts: Renders navigation bar content for each task
├── utils/: Provides tools
│   ├── api.ts: SiYuan API encapsulation (from template)
│   ├── pluginInstance.ts: Plugin instance management tool
│   ├── DOMUtils.ts: DOM processing tools
│   ├── docUtils.ts: Document processing tools
│   ├── logger.ts: Logging tool
```

Manual installation:
- Download and unzip package.zip, rename it to `siyuan-doc-navbar-light`, move it to the `<SiYuan workspace>/data/plugins/` directory
- In SiYuan Note, click `Settings -> Marketplace -> Downloaded -> Plugins`, find `Document Navigation Bar (siyuan-doc-navbar-light)`, and click `Enable`