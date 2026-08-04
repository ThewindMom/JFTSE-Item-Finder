export type FrameScheduler = {
    request(callback: FrameRequestCallback): number,
    cancel(handle: number): void,
};

export type ProgressiveBatchState = {
    version: number,
    rendered: number,
    total: number,
    complete: boolean,
};

type ProgressiveBatchOptions<Input, Output> = {
    scheduler: FrameScheduler,
    now(): number,
    initialRows: number,
    rowsPerRequest: number,
    maxRowsPerFrame: number,
    frameBudgetMs: number,
    create(input: Input): Output,
    commit(batch: readonly Output[], state: ProgressiveBatchState): void,
    pause(state: ProgressiveBatchState): void,
    complete(state: ProgressiveBatchState): void,
};

export class ProgressiveBatchRenderer<Input, Output> {
    private version = 0;
    private frameHandle: number | undefined;
    private inputs: readonly Input[] = [];
    private rendered = 0;
    private running = false;

    constructor(private readonly options: ProgressiveBatchOptions<Input, Output>) {}

    start(inputs: readonly Input[]): number {
        this.cancelFrame();
        const version = ++this.version;
        this.inputs = inputs;
        this.rendered = 0;
        this.running = true;
        this.commitRows(
            version,
            Math.min(inputs.length, Math.max(1, this.options.initialRows)),
            Math.max(1, this.options.initialRows),
        );
        return version;
    }

    continue(): boolean {
        if (this.running || this.rendered >= this.inputs.length) {
            return false;
        }
        this.running = true;
        const version = this.version;
        const target = Math.min(
            this.inputs.length,
            this.rendered + Math.max(1, this.options.rowsPerRequest),
        );
        this.frameHandle = this.options.scheduler.request(() => {
            this.runFrame(version, target);
        });
        return true;
    }

    cancel(): void {
        this.cancelFrame();
        this.version += 1;
        this.inputs = [];
        this.rendered = 0;
        this.running = false;
    }

    private runFrame(version: number, target: number): void {
        this.frameHandle = undefined;
        if (version !== this.version) {
            return;
        }
        this.commitRows(
            version,
            target,
            this.options.maxRowsPerFrame,
            this.options.frameBudgetMs,
        );
    }

    private commitRows(
        version: number,
        target: number,
        limit: number,
        budgetMs?: number,
    ): void {
        const startedAt = this.options.now();
        const batch: Output[] = [];
        while (this.rendered < target && batch.length < limit) {
            batch.push(this.options.create(this.inputs[this.rendered]));
            this.rendered += 1;
            if (
                budgetMs !== undefined &&
                this.options.now() - startedAt >= budgetMs
            ) {
                break;
            }
        }

        if (version !== this.version) {
            return;
        }
        const state: ProgressiveBatchState = {
            version,
            rendered: this.rendered,
            total: this.inputs.length,
            complete: this.rendered === this.inputs.length,
        };
        this.options.commit(batch, state);
        if (version !== this.version) {
            return;
        }
        if (state.complete) {
            this.running = false;
            this.options.complete(state);
            return;
        }
        if (this.rendered >= target) {
            this.running = false;
            this.options.pause(state);
            return;
        }
        this.frameHandle = this.options.scheduler.request(() => {
            this.runFrame(version, target);
        });
    }

    private cancelFrame(): void {
        if (this.frameHandle === undefined) {
            return;
        }
        this.options.scheduler.cancel(this.frameHandle);
        this.frameHandle = undefined;
    }
}

export const browserFrameScheduler: FrameScheduler = {
    request(callback) {
        return requestAnimationFrame(callback);
    },
    cancel(handle) {
        cancelAnimationFrame(handle);
    },
};
