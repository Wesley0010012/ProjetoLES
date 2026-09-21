import { Rule } from './Rule';

export class RulesMap<T> implements Rule<T> {
  public constructor(private readonly _rules: Rule<T>[]) {}

  public async validate(data: T): Promise<void> {
    for (const rule of this._rules) {
      await rule.validate(data);
    }
  }
}
