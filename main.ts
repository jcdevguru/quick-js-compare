import { mkComparer } from './src/compare-methods';
const compare = mkComparer();

const r1 = compare({ b: 5, d: 'r', a: 2 }, { a: 2, c: 'bird', b: 5, d: 'q' });
console.log(JSON.stringify(r1));

// circular nonsense
const left = { a: { c: 1, e: {}, d: { a: 1 }}};
// should be ok - reference at same level
left.a.e = left.a.d; 
const right = { a: { c: 2, d: { a: 3 }, e: { a: 4  }}};

const r2 = compare(left, right);
console.log(JSON.stringify(r2, null, 2));

// now mess with them.
// no results should exist from left.a.e
left.a.e = left.a;

const r3 = compare(left, right);
console.log(JSON.stringify(r3, null, 2));

// ok to reference between objects
left.a.e = right.a;

const r4 = compare(left, right);
console.log(JSON.stringify(r4, null, 2));