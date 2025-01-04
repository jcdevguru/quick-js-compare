import type { MinimalConfigOptions } from '../../lib/option';
import type { Value, ObjectKey } from '../../lib/types';
import Compare from '../../compare';

export type TestKeys = Partial<{
  sameKeys: ObjectKey[];
  leftKeys: ObjectKey[];
  rightKeys: ObjectKey[];
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

export const expectValueArray = (keys: ObjectKey[]) => 
  expect.arrayContaining(keys.map(expectValue));

export const testMatchingKeys = (
  testName: string, 
  left: Value, 
  right: Value, 
  keys: TestKeys,
  options?: MinimalConfigOptions
) => {
  test(compareTestLabel(testName, options), () => {
    const c = new Compare(options);
    const result = c.compare(left, right).result;
    
    const isMatching = !keys.leftKeys && !keys.rightKeys;
    
    expect(result).toEqual({
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
      subResult: expect.objectContaining({
        ...(keys.leftKeys && { left: expectValueArray(keys.leftKeys) }),
        ...(keys.rightKeys && { right: expectValueArray(keys.rightKeys) }),
        ...(keys.sameKeys && {
          leftSame: expectValueArray(keys.sameKeys),
          rightSame: expectValueArray(keys.sameKeys)
        })
      })
    });
  });
};