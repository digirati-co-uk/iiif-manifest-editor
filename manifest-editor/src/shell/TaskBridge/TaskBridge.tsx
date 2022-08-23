// TaskBridge.
import mitt, { Emitter } from "mitt";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

interface Task<Req = any, Res = any> {
  name: string;
  status: "idle" | "running" | "complete" | "error";
  emitter: Emitter<any>;
  promise: Promise<any>;
  abort: AbortController;
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  error?: string;
  request?: Req;
  response?: Res;
}

const tempGlobalState: Record<string, Record<string, Task>> = {};

const DispatchReactContext = createContext<string>("global");

function useCurrentDispatchId() {
  return useContext(DispatchReactContext);
}

function createDeferred() {
  let res: (value: any) => void = undefined as any;
  let rej: (reason?: any) => void = undefined as any;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  return { promise, resolve: res, reject: rej };
}

export function useTask(name: string) {
  const id = useCurrentDispatchId();
  const [, invalidate] = useReducer((r) => r + 1, 0);
  const task = useMemo(() => {
    if (!tempGlobalState[id]) {
      tempGlobalState[id] = {};
    }
    if (!tempGlobalState[id][name]) {
      tempGlobalState[id][name] = {
        name,
        emitter: mitt(),
        status: "idle",
        promise: Promise.resolve(),
        abort: new AbortController(),
        reject: () => void 0,
        resolve: () => void 0,
      };
    }

    return tempGlobalState[id][name];
  }, [id, name]);

  useTaskEvent(task, "abort", invalidate);
  useTaskEvent(task, "error", invalidate);
  useTaskEvent(task, "complete", invalidate);
  useTaskEvent(task, "running", invalidate);

  return task;
}

export function useTaskEvent<Req = any, Res = any>(
  task: Task<Req, Res>,
  name: string,
  _cb: (task: Task<Req, Res>) => any
) {
  const cb = useCallback(() => _cb(task), [_cb]);
  useEffect(() => {
    const em = task.emitter;
    em.on(name, cb);
    return () => em.off(name, cb);
  }, [name, cb, task.emitter]);
}

export function useTaskDispatch<Req = any, Res = any>(
  name: string,
  onComplete: (task: Task<Req, Res>) => void | Promise<void>
) {
  const taskDetails = useTask(name);

  useTaskEvent(taskDetails, "complete", onComplete);

  const runTask = (request?: any) => {
    // Abort running tasks.
    if (taskDetails.status === "running") {
      taskDetails.abort.abort();
      taskDetails.emitter.emit("abort");
    }

    // Error clearing.
    if (taskDetails.error) {
      taskDetails.error = "";
    }

    // Creating new task.
    const d = createDeferred();
    d.promise.then(() => taskDetails.emitter.emit("complete")).catch(() => taskDetails.emitter.emit("error"));
    taskDetails.status = "running";
    taskDetails.request = request;
    taskDetails.promise = d.promise;
    taskDetails.resolve = d.resolve;
    taskDetails.reject = d.reject;
    taskDetails.emitter.emit("running");
  };

  return [runTask, taskDetails] as const;
}

export function useTaskRunner<Req = any, Res = any>(
  name: string,
  onRun: (task: Task<Req, Res>) => void | Promise<void>
) {
  const taskDetails = useTask(name);

  useTaskEvent(taskDetails, "running", onRun);

  const completeTask = (response?: any) => {
    if (taskDetails.status === "running") {
      taskDetails.response = response;
      taskDetails.status = "complete";
      taskDetails.resolve();
    }
    //
  };

  const rejectTask = (reason?: any, error?: any) => {
    if (taskDetails.status === "running") {
      taskDetails.error = error || reason;
      taskDetails.status = "error";
      taskDetails.reject(reason);
    }
  };

  return [completeTask, taskDetails, rejectTask] as const;
}

export function TaskBridge({ children }: { children?: ReactNode }) {
  return (
    <DispatchReactContext.Provider value={useMemo(() => `id-${Date.now()}`, [])}>
      {children}
    </DispatchReactContext.Provider>
  );
}
