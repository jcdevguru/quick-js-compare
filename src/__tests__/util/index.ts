import type { MinimalConfigOptions } from '../../lib/option';
import type { Value, Scalar } from '../../lib/types';
import Compare from '../../compare';

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

export const scalarCollection = (
  left: Value, 
  right: Value, 
  values: TestValues,
  options?: MinimalConfigOptions
) => {
  const c = new Compare(options);
  const result = c.compare(left, right).result;
  
  const isMatching = !values.leftValues && !values.rightValues;
  
  return expect(result).toEqual({
    ...(isMatching 
      ? {
          leftSame: [expectValue(left)],
          rightSame: [expectValue(right)]
        }
      : {
          left: [expectValue(left)],
          right: [expectValue(right)]
        }
    ),
    subResult: {
      ...(values.leftValues && { left: expectValueArray(values.leftValues) }),
      ...(values.rightValues && { right: expectValueArray(values.rightValues) }),
      ...(values.sameValues && {
        leftSame: expectValueArray(values.sameValues),
        rightSame: expectValueArray(values.sameValues)
      })
    }
  });
};