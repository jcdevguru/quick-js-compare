import {
  type Value,
  actualType
} from '../lib/types';

import type {
  CompareFunc,
  CompareOptionObject,
} from './types';


const exact = (left: Value, right: Value) => left === right;
const reference = exact;
const abstract = (left: Value, right: Value) => left == right;
const typeOnly = (left: unknown, right: unknown): boolean => actualType(left) === actualType(right);
const ignore = () => true;

export const optionTokenToStockMethodMap: Record<keyof CompareOptionObject, Record<string, CompareFunc>> = {
  compareScalar: { strict: exact, abstract, typeOnly, ignore },
  compareObject: {
    reference,
    strict: exact, // TODO: implement
    keyValueOrder: (left, right) => left === right, // TODO: implement
    keyValue: (left, right) => left === right, // TODO: implement
    keyOrder: (left, right) => left === right, // TODO: implement
    valueOrder: (left, right) => left === right, // TODO: implement
    keyOnly: (left, right) => left === right, // TODO: implement
    valueOnly: (left, right) => left === right, // TODO: implement
    typeOnly,
    ignore,
  },
  compareMap: {
    reference,
    strict: exact, // TODO: implement
    keyValueOrder: (left, right) => left === right, // TODO: implement
    keyValue: (left, right) => left === right, // TODO: implement
    typeOnly,
    ignore,
  },
  compareArray: {
    reference,
    strict: exact, // TODO: implement
    indexValue: (left, right) => left === right, // TODO: implement
    valueOrder: (left, right) => left === right, // TODO: implement
    valueOnly: (left, right) => left === right, // TODO: implement
    indexOnly: (left, right) => left === right, // TODO: implement
    sizeOnly: (left, right) => left === right, // TODO: implement
    typeOnly,
    ignore,
  },
  compareSet: {
    reference,
    strict: exact, // TODO: implement
    valueOnly: (left, right) => left === right, // TODO: implement
    sizeOnly: (left, right) => left === right, // TODO: implement
    typeOnly,
    ignore,
  },
};
