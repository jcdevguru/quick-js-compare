  import type {
    ValueResult,
    ValueResults
  } from "@compare/types";
  
  import {
    type ArrayObject, 
    type Composite, 
    type MapObject, 
    type SetObject,
    type RecordObject,
    type Value,
    actualType
} from "../../lib/types";

import { valueToValueResult } from "@compare/util";

type TypeHandler = Partial<{
  values: (v: Composite) => Iterable<Value>;
  keys: (v: Composite) => Iterable<Value>;
}>

const typeHandlers: Record<string, TypeHandler> = {
  Array: {
    values: (v) => v as ArrayObject,
  },
  Object: {
    keys: (v) => Object.keys(v as RecordObject),
    values: (v) => Object.values(v as RecordObject),
  },
  Map: {
    keys: (v) => (v as MapObject).keys(),
    values: (v) => (v as MapObject).values(),
  },
  Set: {
    values: (v) => v as SetObject,
  }
} as const;

export const values = (v: Composite): Iterable<Value> => {
  const typeName = actualType(v);
  const handler = typeHandlers[typeName]?.values;
  
  if (!handler) {
    throw new Error('Unsupported condition: value is not a composite');
  }
  
  return handler(v);
}

export const keys = (v: Composite): Iterable<Value> => {
  const typeName = actualType(v);
  const handler = typeHandlers[typeName]?.keys;

  if (!handler) {
    throw new Error('Unsupported condition: value is not a composite');
  }
  
  return handler(v);
}

export const valueToArrayValueResult = (value: Value, index: number): ValueResult => 
  valueToValueResult(value, { index });

export const sliceValuesToValueResults = (values: ArrayObject, start: number): ValueResults => 
  values.slice(start).map((value, i) => valueToArrayValueResult(value, start + i));

