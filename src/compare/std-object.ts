import CoreCompare from '.';

import type {
  Value,
  StdObject,
} from '../lib/types';

import {
  type ComparisonResult,
  type StdObjectItem,
  type Comparison,
  actualType,
  typeIsStdObject,
} from './types';

import {
  hasDifferences,
  stdObjectEntriesByKey,
} from './util';

import { OptionObject } from '../lib/option';

export class StdObjectCompare extends CoreCompare {

  public constructor(options?: OptionObject) {
    super(options);
  }

  compare(left: Value, right: Value) : ComparisonResult {
    const baseResult = super.compare(left, right);
    if (hasDifferences(baseResult)) {
      return baseResult;
    }

    const leftType = actualType(left);
    const rightType = actualType(right);

    if (!typeIsStdObject(leftType) || !typeIsStdObject(rightType)) {
      return baseResult;
    }

    const leftEntries = stdObjectEntriesByKey(left as StdObject);
    const rightEntries = stdObjectEntriesByKey(right as StdObject);

    const rightEntrySet = new Set(Object.keys(right as StdObject));

    const cmp: Comparison<StdObjectItem> = {
      leftOnly: [],
      left: [],
      leftSame: [],
      rightSame: [],
      right: [],      
      rightOnly: [],
    };

    Object.entries(leftEntries).forEach(([k, leftEntry]) => {
      const rightEntry = rightEntries[k];
      if (!rightEntry) {
        cmp.leftOnly.push(leftEntry);
        return;
      }

      const entryResult = super.compare(leftEntry.value, rightEntry.value);
      let item: StdObjectItem;
      let hasDiff = false;

      Object.keys(entryResult).forEach((subKey) => {
        switch (subKey) {
          case 'leftOnly':
          case 'left':
            hasDiff = true;

          case 'leftSame':
            item = leftEntry;
            break;
          
          case 'rightOnly':
            hasDiff = true;

          case 'right':
          case 'rightSame':
            item = rightEntry;
            break;

          default:
            return;
        }
        item.comparisonResult = { ...item.comparisonResult, [subKey]: entryResult[subKey] };
      });

      if (hasDiff) {
        cmp.left.push(leftEntry);
        cmp.right.push(rightEntry);
        rightEntrySet.delete(k);
      } else {
        cmp.leftSame.push(leftEntry);
        cmp.rightSame.push(rightEntry);
      }
    });

    cmp.rightOnly = Array.from(rightEntrySet).map((key) => rightEntries[key]);

    const result: ComparisonResult = Object.fromEntries(Object.entries(cmp).filter(([, v]) => v.length));

    return result;
  }
}
