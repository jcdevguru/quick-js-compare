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

export const expectValueInObject = (value: Value) => 
  expect.objectContaining({ value });

export const expectValueInArray = (values: Scalar[]) => 
  expect.arrayContaining(values.map(expectValueInObject));

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
      expectedResult.leftSame = [expectValueInObject(left)];
      expectedResult.rightSame = [expectValueInObject(right)];
      break;

    case false: {
      expectedResult.left = [expectValueInObject(left)];
      expectedResult.right = [expectValueInObject(right)];
      break;
    }
  }
  if (subResultValues) {
    expectedResult.subResult = {
      ...(subResultValues.leftValues && { left: expectValueInArray(subResultValues.leftValues) }),
      ...(subResultValues.rightValues && { right: expectValueInArray(subResultValues.rightValues) }),
      ...(subResultValues.sameValues && {
        leftSame: expectValueInArray(subResultValues.sameValues),
        rightSame: expectValueInArray(subResultValues.sameValues)
      })
    }
  };

  expect(result).toEqual(expectedResult);
};
