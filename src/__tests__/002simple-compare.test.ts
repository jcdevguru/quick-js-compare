// These tests tha are for validations and functinos of
// compare options provided through the top-level function

import CoreCompare from '../compare';

describe('successful compare', () => {
  const testCompare = (testName: string) => {
    const testValue = 'test-string';
    test(testName, () => {
      const left = testValue;
      const right = testValue;
      const c = new CoreCompare();
      const r = c.compare(left, right).result;
      expect(r).toBeInstanceOf(Object);
      expect(r?.leftSame?.[0]?.value).toEqual(left);
      expect(r?.rightSame?.[0]?.value).toEqual(right);
    });
  };

  testCompare('matching strings');
});
