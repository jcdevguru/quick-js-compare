import type {
  CompareFunc,
  Value,
  Comparison,
  Status,
  ReferenceObject,
} from './compare-types';

import {
  type AppOptions,
} from './option';

import {
  GeneralComparer,
  ExactComparer,
} from './compare-methods';

import {
  createComparisonResult,
  valIsReference,
} from './compare-util';

type RefSet = WeakSet<ReferenceObject>;

export default class QuickCompare {
  private match: CompareFunc;

  private refSets = {
    left: new WeakSet<ReferenceObject>(),
    right: new WeakSet<ReferenceObject>(),
  };

  private appOptions: AppOptions;

  private static createMatchFromOptions = (appOptions: Partial<AppOptions>): CompareFunc => {
    const optionsType = typeof appOptions;
    if (optionsType === 'function') {
      return appOptions as CompareFunc<Value>;
    }
    // incomplete
    switch (optionsType) {
      case 'string': {
        const optString = appOptions as string;
        switch (optString) {
          case 'General':
            return GeneralComparer;
          case 'Exact':
            return ExactComparer;
          default:
            throw new Error(`Unsupported options string '${optString}`);
        }
      }

      case 'object':
        break;

      default:
        throw new Error(`Unsupported options type ${optionsType}`);
    }
    // Incomplete
    return ExactComparer;
  };

  private static alreadyTraversed(value: Value, refSet: RefSet): boolean {
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

  constructor(appOptions: Partial<AppOptions> = {}) {
    // TODO: apply defaults
    this.appOptions = appOptions as AppOptions;
    this.match = QuickCompare.createMatchFromOptions(this.appOptions);
  }

  compare(left: Value, right: Value): Comparison {
    let status: Status;
    if (QuickCompare.alreadyTraversed(left, this.refSets.left)
      && QuickCompare.alreadyTraversed(right, this.refSets.right)
    ) {
      status = this.match(left, right, this.appOptions);
    }

    const result = createComparisonResult(status, {
      ...(status === false ? { diff: { left, right } } : { same: { left, right } }),
    });
    return result;
  }
}
