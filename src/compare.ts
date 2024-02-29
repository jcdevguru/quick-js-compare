import type {
  CompareFunc,
  CompareItem,
  Comparison,
  ComparisonStatus,
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

  private static createMatchFromOptions = (appOptions: Partial<AppOptions>): CompareFunc<CompareItem> => {
    const appType = typeof appOptions;
    if (appType === 'function') {
      return appOptions as CompareFunc<CompareItem>;
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

  private static filterReference(item: CompareItem, refSet: RefSet): boolean {
    let rc = true;
    if (valIsReference(item)) {
      if (refSet.has(item)) {
        rc = false;
      } else {
        refSet.add(item);
      }
    }

    return rc;
  }

  protected comparer(leftItem: CompareItem, rightItem: CompareItem): ComparisonStatus {
    return this.match(leftItem, rightItem);
  }

  constructor(appOptions: Partial<AppOptions> = {}) {
    this.appOptions = appOptions;
    this.match = QuickCompare.createMatchFromOptions(this.appOptions);
  }

  compare(left: CompareItem, right: CompareItem): Comparison {
    let status: ComparisonStatus;
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
