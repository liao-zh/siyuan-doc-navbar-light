export class CONSTANTS {
    // 插件信息
    public static readonly PLUGIN_NAME: string = "doc-breadcrumb-light";
    public static readonly PLUGIN_NAME_ZH: string = "文档面包屑";

    // 插件设置
    public static readonly SETTING_STORAGE: string = "menu_config";
    public static readonly SETTING_STORAGE_HEIGHT: string = "400px";
    public static readonly SETTING_KEY_ADJACENTDOC: string = "floatAdjacentDocs";
    public static readonly SETTING_KEY_NEWDOC: string = "enableNewDoc";

    // 自定义名称
    public static readonly CONTAINER_ATTR: string = "data-plugin-tag";
    public static readonly CONTAINER_VALUE: string = "lzh-doc-breadcrumb-light";

    // HTML元素样式
    public static readonly STYLE_DISABLED_OPACITY: string = "0.5";
    public static readonly STYLE_BREADCRUMBITEM_MAXWIDTH: string = "160px";
    public static readonly STYLE_SPACE_MAXWIDTH: string = "12px";
    public static readonly STYLE_ADJACENT_MINWIDTH: string = "160px";
    public static readonly STYLE_CHILDDOCSMENUITEM_MAXWIDTH_DELTA: string = "45";
}
