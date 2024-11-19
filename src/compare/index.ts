
import {
  type Option,
  type OptionObject,
  validateOption,
} from '../lib/option';

import { CompareOption } from './option';

import { OptionError } from '../lib/error';

import type {
  CompareFunc,
  Value,
  ComparisonResult,
  Status,
  ReferenceObject,
} from './types';

import {
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

  private option: OptionObject;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static createMatchFromOptions = (option: CompareOption): CompareFunc => {
    // Incomplete
    return ExactComparer;
  };

  private static nonCircular(value: Value, refSet: RefSet): boolean {
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

  constructor(option?: Option) {
    if (option && !validateOption(option)) {
      throw new OptionError('Invalid option');
    }
    this.option = { compare: 'Exact', render: 'Standard', ...option };
    this.match = CoreCompare.createMatchFromOptions(this.option.compare);
  }

  compare(left: Value, right: Value): ComparisonResult {
    let status: Status;
    if (CoreCompare.nonCircular(left, this.refSets.left)
      && CoreCompare.nonCircular(right, this.refSets.right)
    ) {
      status = this.match(left, right, this.option);
    }

    const result = createComparisonResult(status, {
      ...(status === false ? { diff: { left, right } } : { same: { left, right } }),
    });
    return result;
  }
}
