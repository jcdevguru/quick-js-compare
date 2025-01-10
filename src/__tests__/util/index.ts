import type { MinimalConfigOptions } from '@lib/option';
import type { Value, Scalar } from '@lib/types';
import Compare from '@compare';
import type { CompareResult, ComparisonStatus } from '@compare/types';

export type TestValues = Partial<{
  sameValues: Scalar[];
  leftValues: Scalar[];
  rightValues: Scalar[];
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

export const expectValue = (value: Value) => 
  expect.objectContaining({ value });

export const expectValueArray = (values: Scalar[]) => 
  expect.arrayContaining(values.map(expectValue));

export const verifyCompare = (
  left: Value, 
  right: Value, 
  options: MinimalConfigOptions,
  expectedStatus: ComparisonStatus,
  subResultValues?: TestValues
) => {
  const c = new Compare(options);
  const result = c.compare(left, right).result;

  const expectedResult: CompareResult = {};
  
  switch (expectedStatus) {
    case true:
      expectedResult.leftSame = [expectValue(left)];
      expectedResult.rightSame = [expectValue(right)];
      break;

    case false: {
      expectedResult.left = [expectValue(left)];
      expectedResult.right = [expectValue(right)];
      break;
    }
  }
  if (subResultValues) {
    expectedResult.subResult = {
      ...(subResultValues.leftValues && { left: expectValueArray(subResultValues.leftValues) }),
      ...(subResultValues.rightValues && { right: expectValueArray(subResultValues.rightValues) }),
      ...(subResultValues.sameValues && {
        leftSame: expectValueArray(subResultValues.sameValues),
        rightSame: expectValueArray(subResultValues.sameValues)
      })
    }
  };

  expect(result).toEqual(expectedResult);
};
