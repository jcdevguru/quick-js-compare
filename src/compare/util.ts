import {
  type Value,
  actualType,
} from '@lib/types';

import {
  type ValueResult,
  type ValueResultProps,
} from '@compare/types';

export const valueToValueResult = (value: Value, props: ValueResultProps = {}): ValueResult =>
  ({ typeName: actualType(value), value, ...props });
