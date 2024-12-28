import { type MinimalConfigOptions } from '../../lib/option';

export const compareTestLabel = (testName: string, options?: MinimalConfigOptions) => {
  if (!options) {
    return `${testName} (no options)`;
  }
  const optionString = typeof options.compare == 'string' ? options.compare : JSON.stringify(options.compare);

  return `${testName} (compare options: ${optionString})`;
};