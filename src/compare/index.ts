
import {
  type Option,
  isOption,
} from '../lib/option';

import { OptionError } from '../lib/error';

import type {
  CompareFunc,
  Value,
  ComparisonResult,
  Status,
  ReferenceObject,
} from './types';

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

  private option: Option;

  private static createMatchFromOptions = (option: Option): CompareFunc => {
    const optionType = typeof option;
    // incomplete
    switch (optionType) {
      case 'string': {
        const optString = option as string;
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
        throw new Error(`Unsupported options type ${optionType}`);
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

  constructor(option: Option = { compare: 'Exact', render: 'Standard' }) {
    const errs: Array<string> = [];
    if (option && !isOption(option, errs)) {
      throw new OptionError(`Invalid app options: ${errs.join(', ')}`);
    }
    this.match = CoreCompare.createMatchFromOptions(option);
    this.option = option;
  }

  compare(left: Value, right: Value): ComparisonResult {
    let status: Status;
    if (CoreCompare.alreadyTraversed(left, this.refSets.left)
      && CoreCompare.alreadyTraversed(right, this.refSets.right)
    ) {
      status = this.match(left, right, this.option);
    }

    const result = createComparisonResult(status, {
      ...(status === false ? { diff: { left, right } } : { same: { left, right } }),
    });
    return result;
  }
}
