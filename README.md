## Angular Lifecycle Debugging Logger
[![npm](https://img.shields.io/npm/dt/ng-lifecycle-debug.svg)]()
[![Build Status](https://travis-ci.org/squigg/ng-lifecycle-debug.svg?branch=master)](https://travis-ci.org/squigg/ng-lifecycle-debug)
[![npm](https://img.shields.io/npm/l/ng-lifecycle-debug.svg)]()

#### Decorator to quickly add logging for Angular lifecycle hooks in your components
Minimal markup - no more adding console logs to see what your components are doing!

## Installation

`npm install --save-dev ng-lifecycle-debug`

## Usage

```typescript
import { DebugLifeCycle } from 'ng-lifecycle-debug';

@DebugLifeCycle()
@Component({
  selector: 'app-sheep-stacker',
  templateUrl: './sheep-stacker.component.html',
  styleUrls: ['./sheep-stacker.component.scss']
})
export class SheepStackerComponent implements OnInit, OnChanges {

  @Input() initialStack: number;
  private initialStack$: BehaviorSubject<number>;
  sheepCount$: Observable<number>;

  public ngOnInit(): void {
    this.initialStack$ = new BehaviorSubject<number>(this.initialStack);
    this.sheepCount$ = this.initialStack$.asObservable().pipe(
      switchMap((count) => interval(1000).pipe(map((val) => val + count)))
    );
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialStack'] && !isNaN(+changes['initialStack'].currentValue)) {
      this.initialStack$ && this.initialStack$.next(changes.initialStack.currentValue);
    }
  }

}

// -- Console Output --
// ngOnChanges called for SheepStackerComponent
//    initialStack changed from undefined to 1
// ngOnInit called for SheepStackerComponent
// ngAfterViewInit called for SheepStackerComponent

@DebugLifeCycle('ngOnInit')
// -- Console Output --
// ngOnInit called for SheepStackerComponent

@DebugLifeCycle(['ngOnInit','ngAfterViewInit'])
// -- Console Output --
// ngOnInit called for SheepStackerComponent
// ngAfterViewInit called for SheepStackerComponent

@DebugLifeCycle((hook, className) => console.log(`Awesome ${hook} happened in ${className}`))
// -- Console Output --
// Awesome ngOnChanges happened in SheepStackerComponent
// Awesome ngOnInit happened in SheepStackerComponent
// Awesome ngAfterViewInit happened in SheepStackerComponent

@DebugLifeCycle({hooks: ['ngOnInit','ngAfterViewInit'], logFunc: (hook, className) => console.log(`Awesome ${hook} happened in ${className}`)})
// -- Console Output --
// Awesome ngOnInit happened in SheepStackerComponent
// Awesome ngAfterViewInit happened in SheepStackerComponent

@DebugLifeCycle({hooks: ['ngOnInit','ngAfterViewInit'], logFuncMap: { ngOnInit: () => console.log('Something happened')}})
// -- Console Output --
// Something happened
// ngAfterViewInit called for SheepStackerComponent
```

### Options

### Defaults
Default options are to log the `ngOnInit`, `ngOnChanges`, `ngAfterViewInit`, and `ngOnDestroy` lifecycle hooks using
a simple `console.log`, with a more advanced version using `console.group` for `ngOnChanges`.

### Simple Options
The decorator accepts simplified options for quicker and more limited use:

| Option            | Description                                  |
| ----------------- | -------------------------------------------- |
| `string`          | log a specific lifecycle hook                |
| `string[]`        | log a specific subset of lifecycle hooks     |
| `function`        | a function to use for all logging            |

Note that the default function map (that has a different output for `ngOnChanges`) is still used if a function is
given as a single argument. To override this, use the advanced options with `logFunc` and pass an empty object as the `logFuncMap`.

### Advanced Options
Options are passed as an object with one or more of the following keys:

| Option                | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `hooks: string[]`     | array of Angular lifecycle hooks to respond to                |
| `logFunc: Function`   | specify a custom function for each hook                       |
| `logFuncMap: Object`  | specify different functions for different lifecycle hooks, where the object key is the hook and the value is the function |

Note: the default function map (that has a different output for `ngOnChanges`) is still used if a function is given as
a single argument. For overriding it when

### Option Types and Interfaces
| Type / Interface              | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| `DebugLifeCycleHook`          | String values for Angular lifecycle hooks               |
| `DebugLogFunction`            | Function required for logging `(hook, class, ...args)`  |
| `DebugLogFunctionMap`         | Object for lifecycle hook to function map               |
| `DebugLifeCycleOptionObject`  | Overall configuration object                            |
 
## To Do
- Add optional logging of component properties
- Add capability for enter / exit logging
