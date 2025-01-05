// These tests that are for validations and functinos of
// compare options provided through the top-level function

import { type MinimalConfigOptions } from '../lib/option';
import { scalarCollection, compareTestLabel } from './util';

describe('set comparisons', () => {
  const options: MinimalConfigOptions = { compare: { compareSet: 'strict' } };
  test(compareTestLabel('mismatching set of integers (strict)', options), () => {
    scalarCollection(
      new Set([1, 2, 3]), 
      new Set([1, 2, 4]), 
      {
        sameValues: [1, 2],
        leftValues: [3],
        rightValues: [4]
      },
      options
    );
  });
  
  test(compareTestLabel('matching set of integers (valuesOnly)', options), () => {
    scalarCollection(
      new Set([1, 2, 3]), 
      new Set([1, 2, 3]), 
      {
        sameValues: [1, 2, 3]
      },
      options
    );
  });
});

describe('map comparisons', () => {
  const leftMap = new Map([
    ['a', 1], ['b', 2], ['c', 3]
  ]);
  const rightMap = new Map([
    ['a', 1], ['b', 2], ['d', 3]
  ]);

  const options: MinimalConfigOptions = { compare: { compareMap: 'keysOnly' } };
  test(compareTestLabel('mismatching maps', options), () => {
    scalarCollection(
      leftMap, 
      rightMap, 
      {
        sameValues: ['a', 'b'],
        leftValues: ['c'],
        rightValues: ['d']
      },
      options
    );
  });

  const matchingMap1 = new Map([['a', 1], ['b', 2]]);
  const matchingMap2 = new Map([['a', 10], ['b', 12]]);
  test(compareTestLabel('matching maps', options), () => {
    scalarCollection(
      matchingMap1, 
      matchingMap2, 
      {
        sameValues: ['a', 'b']
      },
      options
    );
  });
});
