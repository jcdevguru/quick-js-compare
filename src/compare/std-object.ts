import CoreCompare from '.';

import {
  type StdObject,
} from '../lib/types';

import type {
  ComparisonResult,
  StdObjectItem,
  Comparison,
} from './types';

import {
  stdObjectEntriesByKey,
} from './util';

import { OptionObject } from '../lib/option';

export class StdObjectCompare extends CoreCompare {

  public constructor(options?: OptionObject) {
    super(options);
  }

  compare(left: StdObject, right: StdObject) : ComparisonResult {
    const leftEntries = stdObjectEntriesByKey(left);
    const rightEntries = stdObjectEntriesByKey(right);

    const rightEntrySet = new Set(Object.keys(right));

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
