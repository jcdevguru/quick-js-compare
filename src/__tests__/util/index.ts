import type { MinimalConfigOptions } from '@lib/option';
import type { Value } from '@lib/types';
import Compare from '@compare';
import type { ComparisonResult, ComparisonStatus } from '@compare/types';

export type TestValues = Partial<{
  same: Array<Value>;
  left: Array<Value>;
  right: Array<Value>;
  subResult?: TestValues;
}>;

export const compareTestLabel = (testName: string, options?: MinimalConfigOptions) => {
  if (!options) {
    return `${testName} (no options)`;
  }
  const optionString = typeof options.compare == 'string' ?
    options.compare :
    JSON.stringify(options.compare);

  return `${testName} (compare options: ${optionString})`;
};

export const expectValueInResultObject = (value: Value) => 
  expect.objectContaining({ value });

export const expectValueInResultArray = (values: Array<Value>) => 
  expect.arrayContaining(values.map(expectValueInResultObject));

export const expectValueInResult = (value: Value) => 
  Array.isArray(value) ? expectValueInResultArray(value) : expectValueInResultObject(value);

const processSubResult = (expectedSubResult: TestValues) => {
  const expectedResult: ComparisonResult = {};
  if (expectedSubResult.same) {
    expectedResult.leftSame = expectValueInResult(expectedSubResult.same);
    expectedResult.rightSame = expectValueInResult(expectedSubResult.same);
  }
  if (expectedSubResult.left) {
    expectedResult.left = expectValueInResultArray(expectedSubResult.left);
  }
  if (expectedSubResult.right) {
    expectedResult.right = expectValueInResultArray(expectedSubResult.right);
  }
  if (expectedSubResult.subResult) {
    expectedResult.subResult = processSubResult(expectedSubResult.subResult);
  }
  return expectedResult;
}

export const verifyCompare = (
  left: Value, 
  right: Value, 
  options: MinimalConfigOptions,
  expectedStatus: ComparisonStatus,
  expectedSubResult?: TestValues
) => {
  const c = new Compare(options);
  const result = c.compare(left, right).result;

  const expectedResult: ComparisonResult = {};
  
  switch (expectedStatus) {
    case true:
      expectedResult.leftSame = [expectValueInResultObject(left)];
      expectedResult.rightSame = [expectValueInResultObject(right)];
      break;

    case false: {
      expectedResult.left = [expectValueInResultObject(left)];
      expectedResult.right = [expectValueInResultObject(right)];
      break;
    }
  }
  if (expectedSubResult) {
    expectedResult.subResult = processSubResult(expectedSubResult);
  }

  expect(result).toEqual(expectedResult);
};
