import {
  type Value,
  type ArrayObject,
  type MapObject,
  type RecordObject,
  type SetObject,
  type FunctionObject,
  isValue,
  isComposite,
  isKeyedObject,
  isScalar,
  isOrderedObject,
} from '@lib/types';

// These tests are for compile-time type relationships
// This helps us make sure we have consistency between type guards and actual types
describe('verify compile-time type relationships', () => {
  const testTypeStructure = <T extends Value>(
    testName: string, 
    sample: T
  ) => {
    test(testName, () => {
      // Verify assignability to Value at compile time
      const value: T = sample;
      expect(value).toBeDefined();  // This is just a placeholder to satisfy the compiler
    });
  };

  testTypeStructure<RecordObject>('RecordObject matches a sample value', { a: 1, b: 'hello' });
  testTypeStructure<MapObject>('MapObject matches a sample value', new Map([['a', 1]]));
  testTypeStructure<SetObject>('SetObject matches a sample value', new Set([1, 2, 3]));
  testTypeStructure<ArrayObject>('ArrayObject matches a sample value', [1, 2, 3]);
  testTypeStructure<RecordObject>('RecordObject matches nested sample value', { a: { b: 1 } });
  testTypeStructure<RecordObject>('mixed object matches a sample value', { 
    map: new Map([['a', 1]]),
    arr: [1, 2, 3],
    set: new Set([4, 5, 6])
  });
  testTypeStructure<FunctionObject>('FunctionObject matches a sample value', () => true);
  testTypeStructure<Value>('Value matches a sample standard object', { a: 1 });
});

describe('verify type guards', () => {
  const testTypeGuard = (testName: string, item: unknown, method: (v: unknown) => boolean, expected: boolean) => {
    test(testName, () => {
      expect(method(item)).toBe(expected);
    });
  };

  testTypeGuard('undefined is scalar', undefined, isScalar, true);
  testTypeGuard('null is scalar', null, isScalar, true);
  testTypeGuard('string is scalar', 'hello', isScalar, true);
  testTypeGuard('number is scalar', 123, isScalar, true);
  testTypeGuard('boolean is scalar', true, isScalar, true);
  testTypeGuard('array is composite', [1, 2, 3], isComposite, true);
  testTypeGuard('object is composite', { a: 1, b: 2 }, isComposite, true);
  testTypeGuard('function is composite', () => true, isComposite, true);
  testTypeGuard('set is composite', new Set([1, 2, 3]), isComposite, true);
  testTypeGuard('map is composite', new Map([['a', 1], ['b', 2]]), isComposite, true);
  testTypeGuard('map is keyed object', new Map([['a', 1], ['b', 2]]), isKeyedObject, true);
  testTypeGuard('std object is keyed object', { a: 1, b: 2 }, isKeyedObject, true);
  testTypeGuard('std object is ordered object', { a: 1, b: 2 }, isOrderedObject, true);
  testTypeGuard('std object is value', { a: 1, b: 2 }, isValue, true);
});
