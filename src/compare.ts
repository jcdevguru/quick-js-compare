import type {
  CompareFunc,
  Value,
  Comparison,
  Status,
  ReferenceObject,
} from './base-types';

import {
  type AppOptions,
} from './option-types';

import {
  GeneralComparer,
  StrictComparer,
} from './compare-methods';

import {
  createComparison,
  valIsReference,
} from './util';

type RefSet = WeakSet<ReferenceObject>;

export default class QuickCompare {
  private match: CompareFunc;

  private refSets = {
    left: new WeakSet<ReferenceObject>(),
    right: new WeakSet<ReferenceObject>(),
  };

  private appOptions: Partial<AppOptions>;

  private static createMatchFromOptions = (appOptions: Partial<AppOptions>): CompareFunc<Value> => {
    const appType = typeof appOptions;
    if (appType === 'function') {
      return appOptions as CompareFunc<Value>;
    }
    // incomplete
    if (appType === 'string') {
      switch (appOptions as string) {
        case 'General':
          return GeneralComparer;
        case 'Strict':
        default:
          return StrictComparer;
      }
    }
    // Incomplete
    return StrictComparer;
  };

  private static filterReference(value: Value, refSet: RefSet): boolean {
    let rc = true;
    if (valIsReference(value)) {
      if (refSet.has(value)) {
        rc = false;
      } else {
        refSet.add(value);
      }
    }

    return rc;
  }

  protected comparer(left: Value, right: Value): Status {
    return this.match(left, right);
  }

  constructor(appOptions: Partial<AppOptions> = {}) {
    this.appOptions = appOptions;
    this.match = QuickCompare.createMatchFromOptions(this.appOptions);
  }

  compare(left: Value, right: Value): Comparison {
    let status: Status;
    if (QuickCompare.filterReference(left, this.refSets.left)
      && QuickCompare.filterReference(right, this.refSets.right)
    ) {
      status = this.match(left, right);
    }

    const result = createComparison(status, {
      ...(status === false ? { diff: { left, right } } : { same: { left, right } }),
    });
    return result;
  }
}
