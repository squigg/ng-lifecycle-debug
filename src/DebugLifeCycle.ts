export type DebugLifeCycleHook =
    'ngOnChanges'
    | 'ngOnInit'
    | 'ngDoCheck'
    | 'ngAfterViewInit'
    | 'ngAfterViewChecked'
    | 'ngAfterContentInit'
    | 'ngAfterContentChecked'
    | 'ngOnDestroy';

export type DebugLogFunction = (hook: DebugLifeCycleHook, className: string, ...any) => void;

export interface DebugLogFunctionMap {
    [key: string]: DebugLogFunction;
}

export interface DebugLifeCycleOptionObject {
    hooks?: DebugLifeCycleHook[];
    logFunc?: DebugLogFunction;
    logFuncMap?: DebugLogFunctionMap;
}

export type DebugLifeCycleOptions =
    DebugLifeCycleOptionObject
    | DebugLifeCycleHook
    | DebugLifeCycleHook[]
    | DebugLogFunction;

class SimpleChange {
    constructor(public previousValue: any, public currentValue: any) {
    }
}

const defaultOptions = {
    hooks: ['ngOnInit', 'ngOnChanges', 'ngAfterViewInit', 'ngOnDestroy'] as DebugLifeCycleHook[],
    logFunc: defaultLogHook,
    logFuncMap: {'ngOnChanges': defaultLogNgOnChanges},
};

function defaultLogHook(hook: string, className: string, ...args: any[]) {
    console.log(`${hook} called for ${className}`);
}

function defaultLogNgOnChanges(hook: string, className: string, changes: { [key: string]: SimpleChange }) {
    console.group(`${hook} called for ${className}`);
    for (const prop in changes) {
        const change = changes[prop];
        let logMessage = prop;
        logMessage += ' changed from ' + JSON.stringify(change.previousValue);
        logMessage += ' to ' + JSON.stringify(change.currentValue);
        console.log(logMessage);
    }
    console.groupEnd();
}

function getDebugLifeCycleOptions(options: DebugLifeCycleOptions): DebugLifeCycleOptionObject {
    if (typeof options === 'string') {
        return {...defaultOptions, hooks: [options]};
    }
    if (typeof options === 'function') {
        return {...defaultOptions, logFunc: options};
    }
    if (options instanceof Array) {
        return {...defaultOptions, hooks: options};
    }
    return {...defaultOptions, ...options};
}

export function DebugLifeCycle(options: DebugLifeCycleOptions = defaultOptions) {

    const debugOptions: DebugLifeCycleOptionObject = getDebugLifeCycleOptions(options);

    return function (constructor: Function) {

        for (const hook of debugOptions.hooks) {
            const originalFunc = constructor.prototype[hook];
            constructor.prototype[hook] = function (...args) {
                const logFunc = debugOptions.logFuncMap[hook] || debugOptions.logFunc;
                logFunc(hook, constructor.name, ...args);
                if (originalFunc) {
                    originalFunc.apply(this, args);
                }
            };
        }
    };

}
