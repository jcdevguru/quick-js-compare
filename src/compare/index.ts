import {
  type Value,
  type Reference,
  actualType,
  isSupportedType,
  isCompositeType,
  isReference,
} from '@lib/types';

import {
  type MinimalConfigOptions,
  type Config,
  validateMinimalConfigOptions,
} from '@lib/option';

import {
  compareConfigToMethodConfig,
  defaultCompareConfigOptions,
  optionAliasToConfigOptions
} from '@compare/option';

import { createStockCompareFunction } from '@compare/stock-methods';
import { OptionError } from '@lib/error';

import {
  type CompareResult,
  type CompareFunction,
  type ComparisonStatus,
  type ValueResults,
  isCompareFunction,
} from './types';

import {
  type CompareConfig,
  type CompareOptions,
  isMinimalCompareConfigOptions,
  isCompareOptionAlias,
  isCompareConfigOptions,
} from './types/config';

import {
  valueToValueResult,
  mergeCompareResults,
} from './util';

const nonCircular = (value: Value, refSet: WeakSet<Reference>): boolean => {
  let rc = true;
  if (isReference(value)) {
    if (refSet.has(value)) {
      rc = false;
    } else {
      refSet.add(value);
    }
  }

  return rc;
}

export default class Compare {
  private static defaultOptions: MinimalConfigOptions = { compare: 'Exact', render: 'Standard' };

  private refSets = {
    left: new WeakSet<Reference>(),
    right: new WeakSet<Reference>(),
  };

  private comparisonResult: CompareResult | undefined;
  private workingResult: CompareResult = {};

  private compareFunction: CompareFunction;

  private configOptions!: MinimalConfigOptions;
  private configuration!: Config;

  private processOptions(options: MinimalConfigOptions): CompareFunction {
    if (!validateMinimalConfigOptions(options)) {
      throw new OptionError('Invalid options');
    }

    let compareOptions = options.compare;
    if (isCompareFunction(compareOptions)) {
      return compareOptions;
    } else if (isCompareOptionAlias(compareOptions)) {
      compareOptions = optionAliasToConfigOptions(compareOptions);
    } else if (isMinimalCompareConfigOptions(compareOptions)) {
      compareOptions = { ...defaultCompareConfigOptions, ...compareOptions };
    }

    if (isCompareConfigOptions(compareOptions)) {
      this.configOptions = { ...options, compare: compareOptions };
      const methodConfig = compareConfigToMethodConfig(compareOptions);
      this.configuration = { ...this.configuration, compare: methodConfig };
    } else {
      // This should not happen because options are supposed to be validated already
      // If it does, it's an internal error
      throw new Error('Internal error: unhandled compare option');
    }

    return createStockCompareFunction(result => this.updateSubResult(result));
  }

  private comparer = (left: Value, right: Value): ComparisonStatus => {
    let status: ComparisonStatus = undefined;

    const leftType = actualType(left);
    const rightType = actualType(right);

    // types of operands must be supported
    // and circular references must be detected and ignored
    if (isSupportedType(leftType) && isSupportedType(rightType)) {
      if (isCompositeType(leftType) !== isCompositeType(rightType)) {
        status = false;
      } else if (nonCircular(left, this.refSets.left) && nonCircular(right, this.refSets.right)) {
        status = this.compareFunction(left, right, this);
      }
    }

    if (status === undefined) {
      // If we don't have a status, we don't have a result
      return status;
    }

    const leftResults: ValueResults = [valueToValueResult(left)];
    const rightResults: ValueResults = [valueToValueResult(right)];

    if (status) {
      this.workingResult.leftSame = leftResults;
      this.workingResult.rightSame = rightResults;
    } else {
      this.workingResult.left = leftResults;
      this.workingResult.right = rightResults;
    }

    return status;
  }

  // Public methods
  constructor(options?: MinimalConfigOptions) {
    this.compareFunction = this.processOptions(options ?? Compare.defaultOptions);
  }

  public compare(left: Value, right: Value): Compare {
    const parentResult = this.workingResult;
    if (!this.comparisonResult) {
      this.comparisonResult = this.workingResult;
    } else {
      if (!this.workingResult.subResult) {
        this.workingResult.subResult = {};
      }
      this.workingResult = this.workingResult.subResult;
    }

    this.comparer(left, right);

    this.workingResult = parentResult;

    return this;
  }

  public addCompare(left: Value, right: Value): Compare {
    if (!this.comparisonResult) {
      return this.compare(left, right);
    }

    const c = new Compare(this.configOptions);
    const resultToAdd = c.compare(left, right).result;
    this.comparisonResult = mergeCompareResults(this.comparisonResult, resultToAdd);

    return this;
  }

  public addSubCompare(left: Value, right: Value): Compare {
    const c = new Compare(this.configOptions);
    const resultToAdd = c.compare(left, right).result;
    this.updateSubResult(resultToAdd);

    return this;
  }

  public recompare(options: MinimalConfigOptions): Compare {
    this.processOptions(options);

    const { leftSame, rightSame, ...rest } = this.comparisonResult || {};

    if (!leftSame || !rightSame) {
      return this;
    }

    // Reset
    this.comparisonResult = rest;
    this.workingResult = this.comparisonResult;
    this.comparisonResult.subResult = undefined;

    this.refSets.left = new WeakSet<Reference>();
    this.refSets.right = new WeakSet<Reference>();

    for (let i = 0; i < leftSame.length; i++) {
      this.addCompare(leftSame[i].value, rightSame[i].value);
    }
  
    return this;
  } 

  public get result(): Readonly<CompareResult> {
    if (!this.comparisonResult) {
      throw new Error('usage error: no result available');
    }

    return this.comparisonResult;
  }

  public get config(): Readonly<Config> {
    return this.configuration;
  }

  public get compareConfig(): CompareConfig {
    return this.configuration.compare;
  }

  public get options(): Readonly<MinimalConfigOptions> {
    return this.configOptions;
  }

  public get compareOptions(): Readonly<CompareOptions> | undefined {
    return this.configOptions.compare;
  }

  private updateSubResult(result: CompareResult) {
    if (!this.comparisonResult) {
      throw new Error('Internal error: no comparison result');
    }

    this.comparisonResult.subResult = mergeCompareResults(this.comparisonResult.subResult || {}, result);
  }

  public get subResult(): Readonly<CompareResult> | undefined {
    return this.result.subResult;
  }
}
