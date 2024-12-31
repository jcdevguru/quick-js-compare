import {
  type Value,
  type Reference,
  type RefSet,
  actualType,
  isSupportedType,
  isCompositeType,
  isReference,
} from '../lib/types';

import {
  type MinimalConfigOptions,
  type Config,
  validateMinimalConfigOptions,
} from '../lib/option';

import {
  compareConfigToMethodConfig,
  defaultCompareConfigOptions,
  optionAliasToConfigOptions
} from './option';

import { stockComparer } from './stock-methods';
import { OptionError } from '../lib/error';

import {
  type CompareResult,
  type CompareFunction,
  type ComparisonStatus,
  isCompareFunction
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
  mergeComparisonResults
} from './util';

const nonCircular = (value: Value, refSet: RefSet): boolean => {
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

  private comparisonResult: CompareResult;
  private workingResult: CompareResult | undefined;

  private compareFunction: CompareFunction = stockComparer;

  private configOptions!: MinimalConfigOptions;
  private configuration!: Config;

  private processOptions(options: MinimalConfigOptions) {
    if (!validateMinimalConfigOptions(options)) {
      throw new OptionError('Invalid options');
    }

    let compareOptions = options.compare;
    if (isCompareFunction(compareOptions)) {
      this.compareFunction = compareOptions;
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

    // TODO: handle render option
  }

  constructor(options?: MinimalConfigOptions) {
    this.processOptions(options ?? Compare.defaultOptions);
    this.comparisonResult = {};
  }

  protected comparer = (left: Value, right: Value): ComparisonStatus => {
    let status: ComparisonStatus = undefined;

    const leftType = actualType(left);
    const rightType = actualType(right);

    // types of operands must be supported
    // and circular references must be detected and ignored
    if (isSupportedType(leftType) && isSupportedType(rightType)) {
      if (isCompositeType(leftType) !== isCompositeType(rightType)) {
        status = false;
      } else if (nonCircular(left, this.refSets.left) && nonCircular(right, this.refSets.right)) {
        status = left === right || undefined;
        if (!status) {
          status = this.compareFunction(left, right, this);
        }
      }
    }

    if (status === undefined) {
      // If we don't have a status, we don't have a result
      return status;
    }

    const leftResult = valueToValueResult(left);
    const rightResult = valueToValueResult(right);

    if (status) {
      this.comparisonResult.leftSame = [leftResult];
      this.comparisonResult.rightSame = [rightResult];
    } else {
      this.comparisonResult.left = [leftResult];
      this.comparisonResult.right = [rightResult];
    }

    return status;
  }

  public compare(left: Value, right: Value): Compare {
    this.comparer(left, right);
    return this;
  }

  public recompare(options: MinimalConfigOptions): Compare {
    this.processOptions(options);

    const { leftSame: leftArray, rightSame: rightArray } = this.comparisonResult;

    if (!leftArray || !rightArray) {
      return this;
    }

    // This just clears out leftSame and rightSame
    this.comparisonResult = mergeComparisonResults({}, this.comparisonResult, ['leftOnly', 'left', 'rightOnly', 'right']);

    this.refSets.left = new WeakSet<Reference>();
    this.refSets.right = new WeakSet<Reference>();

    // Since arrays are same length, we just use leftSame for the length
    for (let i = 0; i < leftArray.length; i++) {
      this.workingResult = {};
      this.comparer(leftArray[i].value, rightArray[i].value);
    }
  
    return this;
  }

  public get result(): Readonly<CompareResult> {
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
}
