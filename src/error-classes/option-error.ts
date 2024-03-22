export default class OptionError extends Error {
  public optionValue?: string;

  constructor(message: string, optionValue?: string) {
    super(message);
    this.optionValue = optionValue;
  }
}
