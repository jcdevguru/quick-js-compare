import { mergeCompareResults, valueToValueResult } from '@compare/util';
import type { CompareResult, ValueResults } from '@compare/types';
import type { Value } from '@lib/types';

// TODO: Add separate test file for valueToValueResult that runs before this one
describe('mergeCompareResults', () => {
  const createValueResults = (values: Value[]): ValueResults => 
    values.map(v => valueToValueResult(v)) as ValueResults;

  const testValues = {
    target: {
      left: [1, 2],
      right: ['a', 'b']
    },
    source: {
      left: [3, 4],
      right: ['c', 'd']
    },
    nested: {
      target: {
        left: [2],
        right: ['b']
      },
      source: {
        left: [3],
        right: ['c']
      }
    }
  };

  test('merges top-level results', () => {
    const targetResult: CompareResult = {
      left: createValueResults(testValues.target.left),
      right: createValueResults(testValues.target.right)
    };
    
    const sourceResult: CompareResult = {
      left: createValueResults(testValues.source.left),
      right: createValueResults(testValues.source.right)
    };

    mergeCompareResults(targetResult, sourceResult);

    expect(targetResult.left).toHaveLength(testValues.target.left.length + testValues.source.left.length);
    expect(targetResult.right).toHaveLength(testValues.target.right.length + testValues.source.right.length);
    expect(targetResult.left?.map(r => r.value)).toEqual([...testValues.target.left, ...testValues.source.left]);
    expect(targetResult.right?.map(r => r.value)).toEqual([...testValues.target.right, ...testValues.source.right]);
  });

  test('merges nested subResults', () => {
    const targetResult: CompareResult = {
      left: createValueResults([1]),
      subResult: {
        left: createValueResults(testValues.nested.target.left),
        right: createValueResults(testValues.nested.target.right)
      }
    };

    const sourceResult: CompareResult = {
      right: createValueResults(['a']),
      subResult: {
        left: createValueResults(testValues.nested.source.left),
        right: createValueResults(testValues.nested.source.right)
      }
    };

    mergeCompareResults(targetResult, sourceResult);

    expect(targetResult.left?.map(r => r.value)).toEqual([1]);
    expect(targetResult.right?.map(r => r.value)).toEqual(['a']);
    expect(targetResult.subResult?.left?.map(r => r.value))
      .toEqual([...testValues.nested.target.left, ...testValues.nested.source.left]);
    expect(targetResult.subResult?.right?.map(r => r.value))
      .toEqual([...testValues.nested.target.right, ...testValues.nested.source.right]);
  });

  test('creates arrays for missing keys', () => {
    const single = {
      left: [1],
      right: ['a']
    };

    const targetResult: CompareResult = {
      left: createValueResults(single.left)
    };

    const sourceResult: CompareResult = {
      right: createValueResults(single.right)
    };

    mergeCompareResults(targetResult, sourceResult);

    expect(targetResult.left?.map(r => r.value)).toEqual(single.left);
    expect(targetResult.right?.map(r => r.value)).toEqual(single.right);
  });

  test('creates subResult if missing in target', () => {
    const values = {
      initial: [1],
      subResult: {
        left: [2],
        right: ['b']
      }
    };

    const targetResult: CompareResult = {
      left: createValueResults(values.initial)
    };

    const sourceResult: CompareResult = {
      subResult: {
        left: createValueResults(values.subResult.left),
        right: createValueResults(values.subResult.right)
      }
    };

    mergeCompareResults(targetResult, sourceResult);

    expect(targetResult.subResult?.left?.map(r => r.value)).toEqual(values.subResult.left);
    expect(targetResult.subResult?.right?.map(r => r.value)).toEqual(values.subResult.right);
  });
}); 