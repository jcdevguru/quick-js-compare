import type {
  Value,
  Reference,
  RefSet,
} from '../lib/types';

import {
  type Option,
  type OptionObject,
  validateOption,
} from '../lib/option';

import { OptionError } from '../lib/error';

import type {
  CompareFunc,
  ComparisonResult,
  CompareOption,
  ComparisonStatus,
} from './types';

import { ExactComparer } from './stock-methods';

import { valIsReference, valueToComparedItem } from './util';
export default class CoreCompare {
  private match: CompareFunc;

  private refSets = {
    left: new WeakSet<Reference>(),
    right: new WeakSet<Reference>(),
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
    let status: ComparisonStatus;
    if (
      CoreCompare.nonCircular(left, this.refSets.left) && 
      CoreCompare.nonCircular(right, this.refSets.right)
    ) {
      status = this.match(left, right, this.option);
      if (status !== undefined) {
        const leftItem = valueToComparedItem(left);
        const rightItem = valueToComparedItem(right);
        if (status) {
          return { leftSame: [leftItem], rightSame: [rightItem] };
        }
        return { left: [leftItem], right: [rightItem] };
      }
    }

    // Incomplete
    // Undefined or circular reference
    return {};
  }
}
