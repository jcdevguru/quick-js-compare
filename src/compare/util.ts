import {
  type ArrayObject,
  type MapObject,
  type RecordObject,
  type SetObject,
  type Value,
  actualType,
} from '@lib/types';

import {
  type ValueResult,
  type ValueResultProps,
} from '@compare/types';

export const valueToValueResult = (value: Value, props: ValueResultProps = {}): ValueResult =>
  ({ typeName: actualType(value), value, ...props });

// Note support for sparse arrays - we store the index of the value within,
// not just its ordinal position within it. This allows clients to give us 
// values to compare in any order or specificity but still use position of values
// when comparing arrays.
export const arrayValueToDetailValueResult = (arr: ArrayObject): ValueResult[] =>
  Object.keys(arr).map((i) => { const index = +i; return valueToValueResult(arr[index], { index }); });

export const objectValueToDetailValueResult = (obj: RecordObject): ValueResult[] =>
  Object.keys(obj).map((key, index) => valueToValueResult(obj[index], { key, index }));

export const setValueToDetailValueResult = (set: SetObject): ValueResult[] =>
  Array.from(set).map((value) => valueToValueResult(value));

export const mapValueToDetailValueResult = (map: MapObject): ValueResult[] =>
  Array.from(map.entries()).map(([key, value], index) => valueToValueResult(value, { key, index }));
