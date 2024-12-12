import {
  type Value,
  type Composite,
  type RefSet,
  isComposite,
} from '../lib/types';

import {
  type Option,
  validateOption,
} from '../lib/option';

import { compareOptionToFunction } from './option';
import { OptionError } from '../lib/error';

import {
  type ComparisonResult,
  type ComparisonStatus,
  type CompareFunc,
  CompareOptionHelperToken,
} from './types';

import { valueToComparedItem } from './util';


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

export default class CoreCompare {
  private refSets = {
    left: new WeakSet<Composite>(),
    right: new WeakSet<Composite>(),
  };

  // incomplete
  private compareOptions: CompareFunc;

  constructor(left: Value, right: Value, options?: Option) {
    if (options && !validateOption(options)) {
      throw new OptionError('Invalid options');
    }

    const option = { compare: 'Exact' as CompareOptionHelperToken, ...options }.compare;

    this.compareOptions = compareOptionToFunction(option);
  }

  public compare(): ComparisonResult {
    let status: ComparisonStatus;
    if (nonCircular(left, this.refSets.left) && nonCircular(right, this.refSets.right)) {
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
