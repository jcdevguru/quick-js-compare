import {
  type Value,
  type Reference,
  type RefSet,
  isComposite,
  actualType,
  isSupportedType,
  isCompositeType,
} from '../lib/types';

import {
  type Option,
  type CoreOptionObject,
  validateOption,
} from '../lib/option';

import { hydrateCompareOption } from './option';
import { stockComparer } from './stock-methods';
import { OptionError } from '../lib/error';

import {
  type CompareResult,
  type CompareFunction,
  isCompareFunction,
  isMinimalCompareOptionObject,
  isCompareOptionHelperToken,
  CoreCompareOption,
  CompareOptionMethodObject,
} from './types';

import {
  resultIsUndefined,
  valueToValueResult,
  mergeComparisonResults
} from './util';

const nonCircular = (value: Value, refSet: RefSet): boolean => {
  let rc = true;
  if (isComposite(value)) {
    if (refSet.has(value)) {
      rc = false;
    } else {
      refSet.add(value);
    }
  }

  return rc;
}

export default class Compare {
  private static defaultOptions: Option = { compare: 'Exact', render: 'Standard' };

  private refSets = {
    left: new WeakSet<Reference>(),
    right: new WeakSet<Reference>(),
  };

  private comparisonResult: CompareResult = {};
  private comparer: CompareFunction = stockComparer;

  private coreOptions!: CoreOptionObject;

  private processOptions(options: Option) {
    if (!validateOption(options)) {
      throw new OptionError('Invalid options');
    }

    if (isCompareFunction(options.compare)) {
      this.comparer = options.compare;
    } else if (isMinimalCompareOptionObject(options.compare) || isCompareOptionHelperToken(options.compare)) {
      const methodObject: CompareOptionMethodObject = hydrateCompareOption(options.compare);
      this.coreOptions = { ...this.coreOptions, compare: methodObject };
    } else {
      throw new Error('Internal error: unhandled compare option state');
    }
  }

  constructor(options?: Option) {
    this.processOptions(options ?? Compare.defaultOptions);
  }

  private coreCompare = (left: Value, right: Value): CompareResult => {
    const leftType = actualType(left);
    const rightType = actualType(right);
    const result: CompareResult = {};

    // types of operands must be supported
    // and circular references must be detected and ignored
    if (
      nonCircular(left, this.refSets.left) &&
      nonCircular(right, this.refSets.right) &&
      isSupportedType(leftType) &&
      isSupportedType(rightType)
    ) {
        const leftResult = valueToValueResult(left);
        const rightResult = valueToValueResult(right);
        
        // a scalar is always considered different from a composite
        if (isCompositeType(leftType) !== isCompositeType(rightType)) {
           result.left = [leftResult];
           result.right = [rightResult];
        } else {
          const subResult: CompareResult = {};
          const comparisonStatus = this.comparer(left, right, this, subResult);
          if (comparisonStatus) {
            if (!resultIsUndefined(subResult)) {
              leftResult.comparisonResult = subResult;
              rightResult.comparisonResult = subResult;
            }
            result.leftSame = [leftResult];
            result.rightSame = [rightResult];
          } else if (comparisonStatus === false) {
              leftResult.comparisonResult = mergeComparisonResults({}, subResult, ['leftOnly', 'left']);
              rightResult.comparisonResult = mergeComparisonResults({}, subResult, ['right', 'rightOnly']);
              result.left = [leftResult];
              result.right = [rightResult];
          }
        }
    }

    return result;
  }

  public compare(left: Value, right: Value): Compare {
    this.comparisonResult = this.coreCompare(left, right);
    
    return this;
  }

  public recompare(options: Option): Compare {
    if (this.isComplete) {
      return this;
    }

    this.processOptions(options);

    const { leftSame = [], rightSame = [] } = this.comparisonResult;

    // Since arrays are same length, we just use leftSame for the length
    const comparisonResult: CompareResult = {};
    for (let i = 0; i < leftSame.length; i++) {
      const result = this.coreCompare(leftSame[i].value, rightSame[i].value);
      mergeComparisonResults(comparisonResult, result);
    }
    this.comparisonResult = comparisonResult;
    return this;
  }

  get isComplete(): boolean {
    const { leftSame = [] } = this.comparisonResult;
    return !leftSame.length;
  }

  get result(): CompareResult {
    return this.comparisonResult;
  }

  get compareOptions(): CoreCompareOption {
    return this.coreOptions.compare;
  }
}