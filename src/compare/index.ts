import { OptionError } from '../lib/error';

import type {
  CompareFunc,
  Value,
  ComparisonResult,
  Status,
  ReferenceObject,
} from './types';

import {
  type AppOptions,
  isAppOptions,
} from '../lib/option';

import {
  GeneralComparer,
  ExactComparer,
} from './stock-methods';

import {
  createComparisonResult,
  valIsReference,
} from './util';

type RefSet = WeakSet<ReferenceObject>;

export default class CoreCompare {
  private match: CompareFunc;

  private refSets = {
    left: new WeakSet<ReferenceObject>(),
    right: new WeakSet<ReferenceObject>(),
  };

  private appOptions: AppOptions;

  private static createMatchFromOptions = (appOptions: AppOptions): CompareFunc => {
    const optionsType = typeof appOptions;
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

  constructor(appOptions: AppOptions = { compare: 'Exact', render: 'Standard' }) {
    const errs: Array<string> = [];
    if (appOptions && !isAppOptions(appOptions, errs)) {
      throw new OptionError(`Invalid app options: ${errs.join(', ')}`);
    }
    this.match = CoreCompare.createMatchFromOptions(appOptions);
    this.appOptions = appOptions;
  }

  compare(left: Value, right: Value): ComparisonResult {
    let status: Status;
    if (CoreCompare.alreadyTraversed(left, this.refSets.left)
      && CoreCompare.alreadyTraversed(right, this.refSets.right)
    ) {
      status = this.match(left, right, this.appOptions);
    }

    const result = createComparisonResult(status, {
      ...(status === false ? { diff: { left, right } } : { same: { left, right } }),
    });
    return result;
  }
}
