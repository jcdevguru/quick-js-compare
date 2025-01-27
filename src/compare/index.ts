import {
  type Value,
  type Reference,
  actualType,
  isSupportedType,
  isCompositeType,
  isReference,
} from '@lib/types';

import { OptionError } from '@lib/error';

import {
  type MinimalConfigOptions,
  type Config,
  validateMinimalConfigOptions,
} from '@lib/option';

import {
  type ComparisonResult,
  type CompareFunction,
  type ComparisonStatus,
  type ComparisonDetails,
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
  compareConfigToMethodConfig,
  defaultCompareConfigOptions,
  optionAliasToConfigOptions
} from '@compare/option';

import { stockComparer } from '@compare/stock-methods';

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

  private compareFunction: CompareFunction;

  private configOptions!: MinimalConfigOptions;
  private configuration!: Config;

  private workingResult: ComparisonResult = {};
  // Convert any passed options to configuration  
  // If options are a compare function, return it
  // Otherwise:
  // - If options are a compare option alias or minimal config options, 
  //   convert them to full compare config options
  // - Convert the compare config options to a method config
  // - Return a function based on stock methods
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
    
    // Now configuration is complete, based on options passed in and
    // stock methods as default.  Use the main stock comparison method
    // to compare values.
    return stockComparer;
  };

  private comparer = (left: Value, right: Value): ComparisonResult => {
    let status: ComparisonStatus = undefined;
    let exactMatch: boolean = false;

    const leftType = actualType(left);
    const rightType = actualType(right);

    // types of operands must be supported
    // and circular references must be detected and ignored
    if (isSupportedType(leftType) && isSupportedType(rightType)) {
      exactMatch = left === right;
      if (!exactMatch) {
        if (isCompositeType(leftType) !== isCompositeType(rightType)) {
          status = false;
        } else if (nonCircular(left, this.refSets.left) && nonCircular(right, this.refSets.right)) {
          // compare function expected to call setComparisonDetails as needed
          status = this.compareFunction(left, right, this);
        }
      } else {
        status = true;
      }
    }

    let result: ComparisonResult | undefined;
    switch (status) {
      case undefined: 
        result = {};
        break;
      case true: 
        result = exactMatch ? { same: left } : { leftSame: left, rightSame: right };
        break;
      case false:
      default:
        result = { left, right };
    }

    return result;
  }

  // Public methods
  constructor(options?: MinimalConfigOptions) {
    this.compareFunction = this.processOptions(options ?? Compare.defaultOptions);
  }

  public compare(left: Value, right: Value): Compare {
    this.comparer(left, right);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addCompare(left: Value, right: Value): Compare {
    // if (!this.comparisonResult) {
    //   return this.compare(left, right);
    // }

    // const c = new Compare(this.configOptions);
    // const resultToAdd = c.compare(left, right).result;
    // this.comparisonResult = mergeCompareResults(this.comparisonResult, resultToAdd);

    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addSubCompare(left: Value, right: Value): Compare {
    // const c = new Compare(this.configOptions);
    // const resultToAdd = c.compare(left, right).result;

    return this;
  }

  public recompare(options: MinimalConfigOptions): Compare {
    this.processOptions(options);

    this.refSets.left = new WeakSet<Reference>();
    this.refSets.right = new WeakSet<Reference>();

    // for (let i = 0; i < leftSame.length; i++) {
    //   this.addCompare(leftSame[i].value, rightSame[i].value);
    // }
  
    return this;
  } 

  public get config(): Readonly<Config> {
    return this.configuration;
  }

  public get compareConfig(): CompareConfig {
    return this.configuration.compare;
  }

  public setComparisonDetails(comparisonDetails: ComparisonDetails) {
    this.workingResult.details = comparisonDetails;
  }

  public get options(): Readonly<MinimalConfigOptions> {
    return this.configOptions;
  }

  public get compareOptions(): Readonly<CompareOptions> | undefined {
    return this.configOptions.compare;
  }

}
