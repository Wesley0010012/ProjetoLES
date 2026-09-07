export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');

/** Transaction boundary exposed to application services without leaking TypeORM. */
export interface UnitOfWork {
  execute<Result>(work: () => Promise<Result>): Promise<Result>;
}
