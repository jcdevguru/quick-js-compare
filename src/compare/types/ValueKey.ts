export type KeyPrefix = 'L' | 'R';
export type ValueKey = string;

export class ValueKeyManager {
  private static levelDelim = '$';
  private static indexDelim = '_';

  private levelIndexes: number[] = [];
  private currentLevel: number = 0;
  private pfx: KeyPrefix;

  constructor(pfx: KeyPrefix) {
    this.pfx = pfx;
  }

  public pushLevel(): number {
    this.currentLevel += 1;
    if (this.levelIndexes.length < this.currentLevel) {
      this.levelIndexes.push(0);
    }
    return this.currentLevel;
  }

  public popLevel(): number {
    this.currentLevel -= 1;
    return this.currentLevel; 
  }

  public incLevelIndex(): number {
    this.levelIndexes[this.currentLevel] += 1;
    return this.levelIndexes[this.currentLevel];
  }
  
  public getKey(): string {
    return `${this.pfx}${ValueKeyManager.levelDelim}${this.levelIndexes.slice(0, this.currentLevel).join(ValueKeyManager.indexDelim)}`;
  }

  public pushKey(): string {
    this.pushLevel();
    return this.getKey();
  }

  public popKey(): string {
    this.popLevel();
    return this.getKey();
  }

  public nextKey(): string {
    this.incLevelIndex();
    return this.getKey();
  }

  public getCurrentLevelIndex(): number {
    return this.levelIndexes[this.currentLevel];
  }

  public getCurrentLevel(): number {
    return this.getCurrentLevelIndex();
  }
}

export const LeftValueKey = () => new ValueKeyManager('L');
export const RightValueKey = () => new ValueKeyManager('R');
