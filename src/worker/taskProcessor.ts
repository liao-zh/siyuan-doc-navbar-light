import { type IProtyle } from "siyuan";
import { ContentInjector } from "@/worker/contentInjector";
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
    private taskQueue: ITask[] = []; // 统一任务队列
    private isProcessing = false; // 是否正在处理队列
    private processingIds = new Set<string>(); // 正在处理的任务ID映射

    /**
     * 添加任务到队列
     * @param task - 要添加的任务
     */
    addTask(task: ITask): void {
        const id = task.protyle.id;

        // 添加任务到队列
        if (!this.processingIds.has(id)) {
            this.taskQueue.push(task);
            logger.logDebug(`任务调度：protyle-${id}，队列中不存在，已添加，当前队列长度: ${this.taskQueue.length}`);
        } else if (task.replace) {
            // this.taskQueue.push(task);
            logger.logDebug(`任务调度：protyle-${id}，队列中已存在，但需要替换，已添加，当前队列长度: ${this.taskQueue.length}`);
        } else {
            logger.logDebug(`任务调度：protyle-${id}，队列中已存在，且不需替换，跳过添加，当前队列长度: ${this.taskQueue.length}`);
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
                logger.logDebug(`任务调度：protyle-${id}，从队列中取出处理，当前队列长度: ${this.taskQueue.length}`);
                this.processingIds.add(id);
                await this.processTask(task);
                logger.logDebug(`任务调度：protyle-${id}，处理完成`);
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
        const contentInjector = new ContentInjector();
        await contentInjector.apply(task.protyle);
    }

    /**
     * 清除所有任务
     */
    clearAllTasks(): void {
        this.taskQueue = [];
        this.processingIds.clear();
        logger.logDebug("任务调度：所有任务已清空");
    }
}

