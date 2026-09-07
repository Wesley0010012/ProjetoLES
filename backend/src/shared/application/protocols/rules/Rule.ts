export interface Rule<T> {
  validate(data: T): Promise<void>;
}
