import { Rule } from './Rule';

export class RulesMap<T> implements Rule<T> {
  private readonly _rules: Rule<T>[];

  public constructor(rules: Rule<T>[]) {
    this._rules = rules;
  }

  public async validate(data: T): Promise<void> {
    for (const rule of this._rules) {
      await rule.validate(data);
    }
  }
}
