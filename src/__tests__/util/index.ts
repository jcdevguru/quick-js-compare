/* eslint-disable @typescript-eslint/no-unused-vars */
import type { MinimalConfigOptions } from '@lib/option';
import type { Value } from '@lib/types';
import Compare from '@compare';

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

export const verifyCompare = (
  left: Value, 
  right: Value, 
  options: MinimalConfigOptions,
  expectedStatus: boolean,
  expectedResult?: unknown
) => {
  const c = new Compare(options);
  const result = c.compare(left, right).result;
  
  expect(result).toBeTruthy();
};
