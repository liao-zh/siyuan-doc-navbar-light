const DISPLAY_NAME = "文档面包屑";

export function logDebug(str: string, ...args: any[]) {
    console.debug(`${DISPLAY_NAME}[D] ${new Date().toLocaleTimeString()} ${str}`, ...args);
}

export function logInfo(str: string, ...args: any[]) {
    console.info(`${DISPLAY_NAME}[I] ${new Date().toLocaleTimeString()} ${str}`, ...args);
}

export function logLog(str: string, ...args: any[]) {
    console.log(`${DISPLAY_NAME}[L] ${new Date().toLocaleTimeString()} ${str}`, ...args);
}

export function logError(str: string, ... args: any[]) {
    console.error(`${DISPLAY_NAME}[E] ${new Date().toLocaleTimeString()} ${str}`, ...args);
    console.trace(args[0] ?? undefined);
}

export function logWarn(str: string, ... args: any[]) {
    console.warn(`${DISPLAY_NAME}[W] ${new Date().toLocaleTimeString()} ${str}`, ...args);
}