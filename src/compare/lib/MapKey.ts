export type KeyPrefix = 'L' | 'R';
export type MapKey = string;

export class MapKeyManager {
  private static levelDelim = '$';
  private static indexDelim = '_';

  private levelIndexes: number[] = [0];
  private currentLevel: number = 0;
  private pfx: KeyPrefix;

  constructor(pfx: KeyPrefix) {
    this.pfx = pfx;
  }

  public pushLevel(): number {
    this.currentLevel += 1;
    if (this.levelIndexes.length <= this.currentLevel) {
      this.levelIndexes.push(0);
    }
    return this.currentLevel;
  }

  public popLevel(): number {
    if (this.currentLevel > 0) {
      this.currentLevel -= 1;
    }
    return this.currentLevel; 
  }

  public incIndex(): number {
    this.levelIndexes[this.currentLevel] += 1;
    return this.levelIndexes[this.currentLevel];
  }
  
  private composeKey(keyBody: string) : string {
    return `${this.pfx}${MapKeyManager.levelDelim}${keyBody}`;
  }

  private composeKeyBody(stopIndex: number): string {
    return `${this.levelIndexes.slice(1, stopIndex).join(MapKeyManager.indexDelim)}`;
  }

  public getKey(): string {
    return this.composeKey(this.composeKeyBody(this.currentLevel+1));
  }

  public getParentKey(): string {
    return this.composeKey(this.composeKeyBody(this.currentLevel));
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
    this.incIndex();
    return this.getKey();
  }

  public getCurrentIndex(): number {
    return this.levelIndexes[this.currentLevel];
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }
}