import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';

type RequestData = Record<string, unknown>;

export abstract class Request {
  private readonly _data: RequestData;

  protected constructor(data: unknown) {
    this._data = this.isRequestData(data) ? data : {};
  }

  protected required(param: string): unknown {
    const value = this._data[param];

    if (value === undefined || value === null) {
      throw new BadRequest(MessageKeyEnum.MISSING_PARAM, { param });
    }

    return value;
  }

  protected string(param: string): string {
    const value = this.required(param);

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    }

    return value;
  }

  protected email(param: string): string {
    const value = this.string(param);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    }

    return value;
  }

  protected number(param: string): number {
    const value = this.required(param);
    const parsedValue =
      typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

    if (typeof parsedValue !== 'number' || !Number.isFinite(parsedValue)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    }

    return parsedValue;
  }

  protected integer(param: string): number {
    const value = this.number(param);

    if (!Number.isInteger(value)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    }

    return value;
  }

  protected positiveNumber(param: string): number {
    const value = this.number(param);

    if (value <= 0) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    }

    return value;
  }

  protected positiveInteger(param: string): number {
    const value = this.integer(param);

    if (value <= 0) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    }

    return value;
  }

  protected boolean(param: string): boolean {
    const value = this.required(param);

    if (typeof value !== 'boolean') {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    }

    return value;
  }

  protected object(param: string): Record<string, unknown> {
    const value = this.required(param);

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    }

    return value as Record<string, unknown>;
  }

  protected optionalString(param: string): string | undefined {
    const value = this._data[param];

    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return this.string(param);
  }

  protected optionalInteger(param: string): number | undefined {
    const value = this._data[param];

    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return this.integer(param);
  }

  protected enumValue<T extends string>(
    param: string,
    acceptedValues: readonly T[],
  ): T {
    const value = this.string(param);

    if (!acceptedValues.includes(value as T)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    }

    return value as T;
  }

  protected bearerToken(param: string): string {
    const value = this.string(param);
    const match = value.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1]?.trim();

    if (!token) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    }

    return token;
  }

  private isRequestData(data: unknown): data is RequestData {
    return typeof data === 'object' && data !== null && !Array.isArray(data);
  }
}
