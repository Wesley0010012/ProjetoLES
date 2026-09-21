export function compareValues(first: unknown, second: unknown): number {
  if (first === second) {
    return 0;
  }

  if (first === undefined || first === null) {
    return 1;
  }

  if (second === undefined || second === null) {
    return -1;
  }

  if (first instanceof Date && second instanceof Date) {
    return first.getTime() - second.getTime();
  }

  if (typeof first === 'string' && typeof second === 'string') {
    return first.localeCompare(second);
  }

  return first < second ? -1 : 1;
}
