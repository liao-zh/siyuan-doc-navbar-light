import { type IProtyle } from "siyuan";
import { ContentInjector } from "@/worker/contentInjector";
import * as logger from "@/utils/logger";

interface ITask {
    protyle: IProtyle;
    replace: boolean;
}

// 任务处理调度器，使用统一队列管理所有任务处理
export class TaskProcessor {
    private processingIds = new Set<string>(); // 正在处理的任务ID映射
    private taskQueue: ITask[] = []; // 统一任务队列
    private isProcessing = false; // 是否正在处理队列

    addTask(task: ITask): void {
        const id = task.protyle.id;

        // 添加任务到队列
        const taskExists = this.taskQueue.some(task => (task.protyle.id === id));

        // 只有当队列中不存在相同protyle的任务时才添加
        if (!taskExists && !this.processingIds.has(id)) {
            this.taskQueue.push(task);
            logger.logDebug(`任务${id}：已加入队列，当前队列长度: ${this.taskQueue.length}`);

            // 如果队列未开始处理，启动处理
            if (!this.isProcessing) {
                this.processQueue();
            }
        } else if (!this.processingIds.has(id)) {
            logger.logDebug(`任务${id}：已存在于队列中，跳过添加`);
        } else {
            logger.logDebug(`任务${id}：正在处理中，跳过添加`);
        }

    }

    // 处理任务队列
    private async processQueue(): Promise<void> {
        // 如果队列为空或已经在处理中，返回
        if (this.taskQueue.length === 0 || this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        try {
            // 使用迭代方式处理队列，避免递归深度过大导致栈溢出
            while (this.taskQueue.length > 0) {
                // 取出队列中的第一个任务
                const task = this.taskQueue.shift();
                if (task) {
                    if (!this.processingIds.has(task.protyle.id)) {
                        await this.processTask(task);
                    } else {
                        // 如果文档正在处理中，将任务重新加入队列末尾
                        this.taskQueue.push(task);
                        logger.logDebug(`任务${task.protyle.id}：正在处理中，任务已重新加入队列`);
                    }
                }
            }
        } catch (error) {
            logger.logError("处理任务队列时出错：", error);
            // 错误发生后，如果队列还有任务，重新启动处理
            if (this.taskQueue.length > 0) {
                // 使用setTimeout避免在catch块中直接递归调用
                setTimeout(() => this.processQueue(), 0);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    // 处理单个任务
    private async processTask(task: ITask): Promise<void> {
        const id = task.protyle.id;

        try {
            // 标记文档正在处理
            this.processingIds.add(id);
            logger.logDebug(`任务${id}：开始处理`);

            // 执行实际的处理逻辑
            const contentInjector = new ContentInjector();
            // 是否replace要放在处理时判断，如果在添加任务时提前判断，可能到了处理时状态又改变了
            await contentInjector.apply(task.protyle, task.replace);
            logger.logDebug(`任务${id}：处理完成`);
        } catch (error) {
            logger.logError(`任务${id}：处理时出错:`, error);
        } finally {
            // 移除正在处理标记
            this.processingIds.delete(id);
        }
    }

    //  清除所有任务
    clearAllTasks(): void {
        this.taskQueue = [];
        this.processingIds.clear();
        logger.logDebug("所有任务已清空");
    }
}

