/**
 * 任务处理调度器
 */
import { type IProtyle } from "siyuan";
import { ContentRenderer } from "@/worker/contentRenderer";
import * as logger from "@/utils/logger";

/**
 * 任务接口，定义任务的结构
 * @property {IProtyle} protyle - 关联的Protyle实例
 * @property {boolean} replace - 是否替换现有内容
 */
interface ITask {
    protyle: IProtyle;
    replace: boolean;
}

/**
 * 任务处理调度器，使用统一队列管理所有任务处理
 */
export class TaskProcessor {
    private contentRenderer: ContentRenderer; // 内容渲染器
    private taskQueue: ITask[] = []; // 统一任务队列
    private isProcessing = false; // 是否正在处理队列
    private processingIds = new Set<string>(); // 正在处理的任务ID映射

    /**
     * 构造函数，初始化任务处理调度器
     * @param contentRenderer - 内容渲染器实例
     */
    constructor(contentRenderer: ContentRenderer) {
        this.contentRenderer = contentRenderer;
    }

    /**
     * 添加任务到队列
     * @param task - 要添加的任务
     */
    addTask(task: ITask): void {
        const id = task.protyle.id;

        // 队列中已有该 protyle 的任务时无需重复排队（稍后取出处理时会读取最新状态）
        const queued = this.taskQueue.some(t => t.protyle.id === id);

        // 正在处理中的 protyle 若来了 replace 任务（移动/重命名/删除文档、设置变更后的全量刷新），
        // 必须入队：否则这笔刷新会正好撞在在飞的渲染上被丢弃，导航条停留在旧状态
        if (!queued && (!this.processingIds.has(id) || task.replace)) {
            this.taskQueue.push(task);
            // logger.logDebug(`任务调度：protyle-${id}，已入队，当前队列长度: ${this.taskQueue.length}`);
        }

        // 如果队列未开始处理，启动处理
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * 处理任务队列
     */
    private async processQueue(): Promise<void> {
        this.isProcessing = true;

        while (this.taskQueue.length > 0) {
            // 取出队列中的第一个任务处理
            const task = this.taskQueue.shift();
            const id = task.protyle.id;
            try {
                // logger.logDebug(`任务调度：protyle-${id}，从队列中取出处理，当前队列长度: ${this.taskQueue.length}`);
                this.processingIds.add(id);
                await this.processTask(task);
                // logger.logDebug(`任务调度：protyle-${id}，处理完成`);
            } catch (error) {
                logger.logError(`任务调度：protyle-${id}，处理时出错：`, error);
            } finally {
                this.processingIds.delete(id);
            }
        }

        this.isProcessing = false;
    }

    /**
     * 处理单个任务
     * @param task - 要处理的任务
     */
    private async processTask(task: ITask): Promise<void> {
        await this.contentRenderer.update(task.protyle);
    }

    /**
     * 清除所有任务
     */
    clearAllTasks(): void {
        this.taskQueue = [];
        this.processingIds.clear();
        // logger.logDebug("任务调度：所有任务已清空");
    }
}

