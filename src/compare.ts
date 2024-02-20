import type {
  CompareFunc,
  CompareItem,
  CompareResult,
  CompareStatus,
} from './base-types';

import {
  type AppOptions,
} from './option-types';

import {
  GeneralComparer,
  StrictComparer,
} from './compare-methods';

import {
  genResult,
  valIsReference,
} from './compare-utils';

export default class QuickCompare {
  private compareMethodFromOptions: CompareFunc<CompareItem>;

  private refSets = {
    left: new WeakSet(),
    right: new WeakSet(),
  };

  private appOptions: Partial<AppOptions>;

  private static defaultMethodFromOptions = (appOptions: Partial<AppOptions>): CompareFunc<CompareItem> => {
    const appType = typeof appOptions;
    if (appType === 'function') {
      return appOptions as CompareFunc<CompareItem>;
    }
    // incomplete
    if (appType === 'string') {
      switch (appOptions as string) {
        case 'General':
          return GeneralComparer;
        default:
          return StrictComparer;
      }
    }
    // Incomplete
    return StrictComparer;
  };

  protected comparer(leftItem: CompareItem, rightItem: CompareItem): CompareStatus {
    return this.compareMethodFromOptions(leftItem, rightItem);
  }

  constructor(appOptions: Partial<AppOptions> = {}) {
    this.appOptions = appOptions;
    this.compareMethodFromOptions = QuickCompare.defaultMethodFromOptions(this.appOptions);
  }

  protected addLeftReference = (ref: CompareItem) => this.refSets.left.add(ref as object);

  protected referencedInLeft = (ref: CompareItem) => this.refSets.left.has(ref as object);

  protected addRightReference = (ref: CompareItem) => this.refSets.right.add(ref as object);

  protected referencedInRight = (ref: CompareItem) => this.refSets.right.has(ref as object);

  compare(leftItem: CompareItem, rightItem: CompareItem): CompareResult {
    if (leftItem === rightItem) {
      return genResult(leftItem, rightItem, true);
    }
    let leftOp = leftItem;
    let rightOp = rightItem;

    if (valIsReference(leftItem)) {
      this.addLeftReference(leftItem);
    } else if (this.referencedInLeft(leftItem)) {
      leftOp = null;
    }

    if (valIsReference(rightItem)) {
      this.addRightReference(rightItem);
    } else if (this.referencedInRight(rightItem)) {
      rightOp = null;
    }

    const result = genResult(leftItem, rightItem, this.comparer(leftOp, rightOp));

    return result;
  }
}
