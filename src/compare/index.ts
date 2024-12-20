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
  type MinimalConfigOptions,
  type Config,
  validateOptions,
} from '../lib/option';

import { compareConfigToMethodConfig, optionAliasToMethodConfig } from './option';
import { stockComparer } from './stock-methods';
import { OptionError } from '../lib/error';

import {
  type CompareResult,
  type CompareFunction,
  isCompareFunction,
} from './types';

import {
  type CompareConfig,
  type CompareOptions,
  isMinimalCompareConfigOption,
  isCompareOptionAlias,
} from './types/config';

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
  private static defaultOptions: MinimalConfigOptions = { compare: 'Exact', render: 'Standard' };

  private refSets = {
    left: new WeakSet<Reference>(),
    right: new WeakSet<Reference>(),
  };

  private comparisonResult: CompareResult = {};
  private comparer: CompareFunction = stockComparer;

  private configOptions!: MinimalConfigOptions;
  private configuration!: Config;

  private processOptions(options: MinimalConfigOptions) {
    if (!validateOptions(options)) {
      throw new OptionError('Invalid options');
    }

    let compareOption = options.compare;
    if (isCompareFunction(compareOption)) {
      this.comparer = compareOption;
    } else if (isCompareOptionAlias(compareOption)) {
      compareOption = optionAliasToMethodConfig(compareOption);
    }

    if (isMinimalCompareConfigOption(compareOption)) {
      this.configOptions = { ...options, compare: compareOption };
      const methodConfig = compareConfigToMethodConfig(compareOption);
      this.configuration = { ...this.configuration, compare: methodConfig };
    } else {
      // This should not happen since we validate, so if it does, it's an internal error
      throw new Error('Internal error: unhandled compare option');
    }

    // TODO: handle render option
  }

  constructor(options?: MinimalConfigOptions) {
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

  public recompare(options: MinimalConfigOptions): Compare {
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

  get result(): Readonly<CompareResult> {
    return this.comparisonResult;
  }

  get config(): Readonly<Config> {
    return this.configuration;
  }

  get compareConfig(): CompareConfig {
    return this.configuration.compare;
  }

  get options(): Readonly<MinimalConfigOptions> {
    return this.configOptions;
  }

  get compareOptions(): Readonly<CompareOptions> | undefined {
    return this.configOptions.compare;
  }
}
