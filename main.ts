import { compareObjects } from './src/compare';

const result = compareObjects({ a: 1, b: 5 }, { a: 1, c: 'bird', b: 5 });

// eslint-disable-next-line no-console
console.log(JSON.stringify(result, null, 2));
