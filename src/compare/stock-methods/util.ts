import {
  type ArrayObject, 
  type Composite, 
  type MapObject, 
  type SetObject,
  type RecordObject,
  type Value,
  actualType
} from "../../lib/types";

type TypeHandler = Partial<{
  values: (v: Composite) => Iterable<Value>;
  keys: (v: Composite) => Iterable<Value>;
}>

const typeHandlers: Record<string, TypeHandler> = {
  ArrayObject: {
    values: (v) => v as ArrayObject,
  },
  RecordObject: {
    values: (v) => Object.values(v as RecordObject),
  },
  MapObject: {
    values: (v) => (v as MapObject).values(),
  },
  SetObject: {
    values: (v) => v as SetObject,
  }
} as const;

export const values = (v: Composite): Iterable<Value> => {
  const typeName = actualType(v);
  const handler = typeHandlers[typeName as keyof typeof typeHandlers]?.values;
  
  if (!handler) {
    throw new Error('Unsupported condition: value is not a composite');
  }
  
  return handler(v);
}

export const keys = (v: Composite): Iterable<Value> => {
  const typeName = actualType(v);
  const handler = typeHandlers[typeName as keyof typeof typeHandlers]?.keys;
  
  if (!handler) {
    throw new Error('Unsupported condition: value is not a composite');
  }
  
  return handler(v);
}
