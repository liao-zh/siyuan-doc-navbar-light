export class CONSTANTS {
    // 插件设置
    public static readonly SETTING_STORAGE: string = "menu_config";
    public static readonly SETTING_STORAGE_HEIGHT: string = "400px";
    public static readonly SETTING_KEY_ADJACENTDOC: string = "floatAdjacentDocs";
    public static readonly SETTING_KEY_NEWDOC: string = "enableNewDoc";
    public static readonly SETTING_KEY_HIDE_BLOCK_BREADCRUMB: string = "hideBlockBreadcrumb";

    // 自定义名称
    public static readonly CONTAINER_ATTR: string = "data-plugin-tag";
    public static readonly CONTAINER_VALUE: string = "siyuan-doc-navbar-light-container";
    // 导航条主体子节点标记类（外包装容器为唯一带 data-plugin-tag 的元素，主体依赖此类定位/区分原生面包屑）
    public static readonly MAIN_CLASS: string = "siyuan-doc-navbar-light__main";

    // HTML元素样式
    public static readonly STYLE_DISABLED_OPACITY: string = "0.5";
    public static readonly STYLE_BREADCRUMBITEM_MAXWIDTH: string = "160px";
}
