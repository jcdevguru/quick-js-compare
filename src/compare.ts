import type {
  BaseCompareFunc,
  CompareItem,
  CompareResult,
} from './base-types';

import {
  type AppOptions,
} from './option-types';

// incomplete
const defaultComparer = (left: CompareItem, right: CompareItem) => left === right;

export default class QuickCompare {
  public readonly comparer: BaseCompareFunc = defaultComparer;

  protected static methodFromOptions(options: AppOptions): BaseCompareFunc {
    // incomplete
    if (Object.keys(options).length === 0) {
      return (left: CompareItem, right: CompareItem) => left === right;
    }
    return (left: CompareItem, right: CompareItem) => left === right;
  }

  constructor(appOptions?: AppOptions) {
    if (appOptions !== undefined) {
      this.comparer = QuickCompare.methodFromOptions(appOptions);
    }
  }

  compare(leftItem: CompareItem, rightItem: CompareItem): CompareResult {
    let left: CompareItem = null;
    let right: CompareItem = null;

    if (!this.comparer(leftItem, rightItem)) {
      left = leftItem;
      right = rightItem;
    }
    return { left, right };
  }
}
