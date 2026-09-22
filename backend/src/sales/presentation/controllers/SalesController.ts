import { ReviewExchangeRequest } from '../requests/ReviewExchangeRequest';
import { SalesListRequest } from '../requests/SalesListRequest';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ReceiveExchangeRequest } from '../requests/ReceiveExchangeRequest';
import { SalesAnalysisRequest } from '../requests/SalesAnalysisRequest';
import { SalesIdRequest } from '../requests/SalesIdRequest';
import { SALES_USE_CASES } from './SalesUseCases';
import type { SalesUseCases } from './SalesUseCases';

@Controller('admin/sales')
export class SalesController {
  public constructor(
    @Inject(SALES_USE_CASES)
    private readonly _useCases: SalesUseCases,
  ) {}

  @Get()
  public list(@Query() query: unknown) {
    return this._useCases.list(new SalesListRequest(query).toSearch());
  }

  @Get('customer/:id')
  public listCustomer(@Param() params: unknown, @Query() query: unknown) {
    return this._useCases.list(
      new SalesListRequest(query).toSearch(new SalesIdRequest(params).id),
    );
  }

  @Post(':id/process')
  @HttpCode(204)
  public async process(@Param() params: unknown): Promise<void> {
    await this._useCases.process(new SalesIdRequest(params).id);
  }

  @Post(':id/payment')
  @HttpCode(204)
  public async confirmPayment(@Param() params: unknown): Promise<void> {
    await this._useCases.confirmPayment(new SalesIdRequest(params).id);
  }

  @Post(':id/dispatch')
  @HttpCode(204)
  public async dispatch(@Param() params: unknown): Promise<void> {
    await this._useCases.dispatch(new SalesIdRequest(params).id);
  }

  @Post(':id/deliver')
  @HttpCode(204)
  public async deliver(@Param() params: unknown): Promise<void> {
    await this._useCases.deliver(new SalesIdRequest(params).id);
  }

  @Get('exchanges')
  public exchanges(@Query() query: unknown) {
    return this._useCases.exchanges(
      new SalesListRequest(query).toSearch(undefined, true),
    );
  }

  @Post('exchanges/:id/authorize')
  @HttpCode(204)
  public async authorize(
    @Param() params: unknown,
    @Body() body: unknown,
  ): Promise<void> {
    await this._useCases.authorizeExchange(
      new SalesIdRequest(params).id,
      new ReviewExchangeRequest(body).observation,
    );
  }

  @Post('exchanges/:id/reject')
  @HttpCode(204)
  public reject(
    @Param() params: unknown,
    @Body() body: unknown,
  ) {
    return this._useCases.rejectExchange(
      new SalesIdRequest(params).id,
      new ReviewExchangeRequest(body).observation,
    );
  }

  @Post('exchanges/:id/arrival')
  @HttpCode(204)
  public arrival(@Param() params: unknown) {
    return this._useCases.markExchangeReceived(new SalesIdRequest(params).id);
  }
  @Post('exchanges/:id/receive')
  public receive(@Param() params: unknown, @Body() body: unknown) {
    const request = new ReceiveExchangeRequest(body);
    return this._useCases.receiveExchange(
      new SalesIdRequest(params).id,
      request.returnToStock,
      request.receivedAt,
    );
  }

  @Get('analysis')
  public analyze(@Query() query: unknown) {
    const request = new SalesAnalysisRequest(query);
    return this._useCases.analyze(
      request.startDate,
      request.endDate,
      request.groupBy,
    );
  }
}
