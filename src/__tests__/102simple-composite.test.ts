// These tests that are for validations and functinos of
// compare options provided through the top-level function

import Compare from '../compare';
import { type MinimalConfigOptions } from '../lib/option';
import { type Value } from '../lib/types';
import {
  compareTestLabel, 
  expectValue, 
  testMatchingKeys,
} from './util';

describe('set comparisons', () => {
  const testMismatchingSet = (testName: string, left: Value, right: Value, options?: MinimalConfigOptions) => {
    test(compareTestLabel(testName, options), () => {
      const c = new Compare(options);
      expect(c.compare(left, right).result).toStrictEqual({
        left: [expectValue(left)],
        right: [expectValue(right)]
      });
    });
  };

  const testMatchingSet = (testName: string, left: Value, right: Value, options?: MinimalConfigOptions) => {
    test(compareTestLabel(testName, options), () => {
      const c = new Compare(options);
      expect(c.compare(left, right).result).toStrictEqual({
        leftSame: [expectValue(left)],
        rightSame: [expectValue(right)]
      });
    });
  };

  testMismatchingSet('mismatching set of integers (valuesOnly)', 
    new Set([1, 2, 3]), 
    new Set([1, 2, 4]), 
    { compare: { compareSet: 'valuesOnly' } }
  );
  
  testMatchingSet('matching set of integers (valuesOnly)', 
    new Set([1, 2, 3]), 
    new Set([1, 2, 3]), 
    { compare: { compareSet: 'valuesOnly' } }
  );
});

describe('map comparisons', () => {
  // Test data setup
  const leftMap = new Map([
    ['a', 1], ['b', 2], ['c', 3]
  ]);
  const rightMap = new Map([
    ['a', 1], ['b', 2], ['d', 3]
  ]);

  testMatchingKeys('mismatching maps', 
    leftMap, 
    rightMap, 
    {
      sameKeys: ['a', 'b'],
      leftKeys: ['c'],
      rightKeys: ['d']
    },
    { compare: { compareMap: 'keysOnly' } }
  );

  const matchingMap1 = new Map([['a', 1], ['b', 2]]);
  const matchingMap2 = new Map([['a', 10], ['b', 12]]);
  testMatchingKeys('matching maps', 
    matchingMap1, 
    matchingMap2, 
    {
      sameKeys: ['a', 'b']
    },
    { compare: { compareMap: 'keysOnly' } }
  );
});
