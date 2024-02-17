// Utility methods for handling comparisons at runtime

// Primitive types in ES2020+ as string.
// 'null' is excluded because 'typeof'
// returns 'object' on null value.
// supported types only here
const primitiveTypes = new Set([
  'string',
  'number',
  'boolean',
  'undefined',
  'symbol',
  'bigint',
]);

// Works with [...]
const collectionTypes = new Set([
  'Array',
  'Set',
  'Map',
]);

// Has multiple retrievable through key
const keyedTypes = new Set([
  'Object',
  'Array',
  'Map',
]);

const objectTypes = new Set([
  ...[...collectionTypes],
  ...[...keyedTypes],
  'String',
  'Number',
  'Boolean',
  'Symbol',
  'Map',
  'Set',
]);

const functionTypes = new Set([
  'Function',
  'function',
]);

const supportedTypes = new Set([
  ...primitiveTypes,
  ...objectTypes,
]);

export const typeIsSupported = (t: string): boolean => supportedTypes.has(t);
export const typeIsObject = (t: string): boolean => objectTypes.has(t);
export const typeIsGenericObject = (t: string): boolean => t === 'object';
export const typeIsPrimitive = (t: string) : boolean => primitiveTypes.has(t);
export const typeIsStdObject = (t: string) : boolean => t === 'Object';
export const typeIsKeyedObject = (t: string) : boolean => keyedTypes.has(t);
export const typeIsFunction = (t: string) : boolean => functionTypes.has(t);

export const actualType = (v: unknown): string => {
  const t = typeof v;
  return primitiveTypes.has(t) ? t : (v?.constructor.name || t);
};
