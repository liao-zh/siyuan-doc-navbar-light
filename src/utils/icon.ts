/**
 * 把思源存储的 icon 值（IAL 里的 icon 属性）转成可显示的 emoji 文本
 * @description 与原生面包屑一致：支持 unicode 码点（如 "1f4c4"、"1f468-200d-1f4bb"）；
 * 自定义图片表情（":name:"）暂不解析，返回空串由调用方回退到内置图标
 * @param icon - 原始 icon 值
 * @returns {string} - emoji 文本；无法解析时为空串
 */
export function renderEmoji(icon: string): string {
    if ( !icon ) {
        return "";
    }
    if ( !/^[\da-f]+(?:-[\da-f]+)*$/i.test(icon) ) {
        return "";
    }
    try {
        const codes = icon.split("-").map(part => parseInt(part.length < 5 ? "0" + part : part, 16));
        if ( codes.some(code => code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) ) {
            return "";
        }
        return String.fromCodePoint(...codes);
    } catch {
        return "";
    }
}