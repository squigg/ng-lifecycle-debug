import { DebugLifeCycle, DebugLifeCycleOptions } from "../src/DebugLifeCycle";

class SimpleChange {
    constructor(public previousValue: any, public currentValue: any) {
    }
}

describe('DebugLifeCycle Decorator', () => {

    function makeTestClass(options?: DebugLifeCycleOptions) {

        @DebugLifeCycle(options)
        class TestClass {
            ngOnInit() {}
            ngOnDestroy() {}
            ngOnChanges(changes) {}
            ngAfterViewInit() {}
        }

        return new TestClass();
    }

    afterEach(() => {
            jest.clearAllMocks();
        }
    );

    test('should call original lifecycle function when invoked', () => {
        let wasCalled = false;

        @DebugLifeCycle()
        class TestClass {
            ngOnInit() {
                wasCalled = true;
            }
        }

        const testClass = new TestClass();
        testClass.ngOnInit();
        expect(wasCalled).toEqual(true);
    });

    test('should call given log function when lifecycle hook invoked', () => {
        const logFunc = jest.fn();
        const testClass = makeTestClass({logFunc: logFunc});
        testClass.ngOnInit();
        expect(logFunc).toHaveBeenCalledTimes(1);
    });

    test('should accept single log function as options and call it when lifecycle hook invoked', () => {
        const logFunc = jest.fn();
        const testClass = makeTestClass(logFunc);
        testClass.ngOnInit();
        expect(logFunc).toHaveBeenCalledTimes(1);
    });

    test('should accept single string lifecycle method as options and call default log function', () => {
        const testClass = makeTestClass('ngOnInit');
        const consoleLogSpy = jest.spyOn(console, 'log');
        testClass.ngOnInit();
        testClass.ngOnDestroy();
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('ngOnInit called for TestClass');
    });

    test('should accept an array of lifecycle methods as options and call default log function for each', () => {
        const testClass = makeTestClass(['ngOnInit', 'ngOnDestroy']);
        const consoleLogSpy = jest.spyOn(console, 'log');
        testClass.ngOnInit();
        testClass.ngOnDestroy();
        testClass.ngAfterViewInit();
        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
        expect(consoleLogSpy).toHaveBeenCalledWith('ngOnInit called for TestClass');
        expect(consoleLogSpy).toHaveBeenCalledWith('ngOnDestroy called for TestClass');
    });

    test('should use default logging style for ngOnChanges lifecycle hook', () => {
        const testClass = makeTestClass();

        const consoleLogSpy = jest.spyOn(console, 'log');
        const consoleLogGroupSpy = jest.spyOn(console, 'group');
        const consoleLogGroupEndSpy = jest.spyOn(console, 'groupEnd');

        testClass.ngOnChanges({prop: new SimpleChange(1, 2)});
        expect(consoleLogGroupSpy).toHaveBeenCalledWith('ngOnChanges called for TestClass');
        expect(consoleLogSpy).toHaveBeenCalledWith('prop changed from 1 to 2');
        expect(consoleLogGroupEndSpy).toHaveBeenCalledTimes(1);
    });

    test('should accept a log function map and call appropriate functions or default function', () => {
        const logFunc1 = jest.fn();
        const logFunc2 = jest.fn();
        const testClass = makeTestClass({logFuncMap: {ngOnInit: logFunc1, ngOnDestroy: logFunc2}});
        const consoleLogSpy = jest.spyOn(console, 'log');
        testClass.ngOnInit();
        testClass.ngOnDestroy();
        testClass.ngAfterViewInit();
        expect(consoleLogSpy).toHaveBeenCalledWith('ngAfterViewInit called for TestClass');
        expect(logFunc1).toHaveBeenCalledTimes(1);
        expect(logFunc2).toHaveBeenCalledTimes(1);
    });

    test('should accept a full object of options', () => {
        const logFunc1 = jest.fn();
        const logFunc2 = jest.fn();
        const testClass = makeTestClass({
            hooks: ['ngOnInit', 'ngOnDestroy'],
            logFunc: logFunc1,
            logFuncMap: {ngOnDestroy: logFunc2}
        });
        const consoleLogSpy = jest.spyOn(console, 'log');
        testClass.ngOnInit();
        testClass.ngOnDestroy();
        testClass.ngAfterViewInit();
        expect(logFunc1).toHaveBeenCalledTimes(1);
        expect(logFunc2).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should correctly bind this when running existing functions', () => {

        @DebugLifeCycle()
        class TestClass {
            public wasCalled = false;

            ngOnInit() {
                this.wasCalled = true;
            }
        }

        const testClass = new TestClass();
        expect(testClass.wasCalled).toEqual(false);
        testClass.ngOnInit();
        expect(testClass.wasCalled).toEqual(true);

    });
});
