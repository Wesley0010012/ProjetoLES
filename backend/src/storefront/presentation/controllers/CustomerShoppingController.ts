import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from 'src/users/presentation/middlewares/TokenValidationMiddleware';
import { CartItemRequest } from '../requests/CartItemRequest';
import { CatalogQueryRequest } from '../requests/CatalogQueryRequest';
import { CheckoutRequest } from '../requests/CheckoutRequest';
import { CustomerExchangeRequest } from '../requests/CustomerExchangeRequest';
import { StorefrontIdRequest } from '../requests/StorefrontIdRequest';
import { CUSTOMER_SHOPPING_USE_CASES } from './CustomerShoppingUseCases';
import type { CustomerShoppingUseCases } from './CustomerShoppingUseCases';

@Controller('customer')
export class CustomerShoppingController {
  public constructor(
    @Inject(CUSTOMER_SHOPPING_USE_CASES)
    private readonly _shopping: CustomerShoppingUseCases,
  ) {}

  @Get('coupons')
  public coupons(@Req() request: AuthenticatedRequest) {
    return this._shopping.coupons(request.authenticatedUser!.id);
  }
  @Post('orders/:id/receipt')
  @HttpCode(204)
  public receipt(
    @Req() request: AuthenticatedRequest,
    @Param() params: unknown,
  ) {
    return this._shopping.confirmReceipt(
      request.authenticatedUser!.id,
      new StorefrontIdRequest(params).id,
    );
  }
  @Post('orders/:id/cancel')
  @HttpCode(204)
  public cancel(
    @Req() request: AuthenticatedRequest,
    @Param() params: unknown,
  ) {
    return this._shopping.cancelOrder(
      request.authenticatedUser!.id,
      new StorefrontIdRequest(params).id,
    );
  }
  @Post('exchanges/:id/dispatch')
  @HttpCode(204)
  public dispatch(
    @Req() request: AuthenticatedRequest,
    @Param() params: unknown,
  ) {
    return this._shopping.dispatchExchange(
      request.authenticatedUser!.id,
      new StorefrontIdRequest(params).id,
    );
  }

  @Get('cart')
  public cart(@Req() request: AuthenticatedRequest) {
    return this._shopping.cart(request.authenticatedUser!.id);
  }

  @Post('cart/items')
  public addItem(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const item = new CartItemRequest(body);
    return this._shopping.addItem(
      request.authenticatedUser!.id,
      item.bookId,
      item.quantity,
    );
  }

  @Put('cart/items/:bookId')
  public updateItem(
    @Req() request: AuthenticatedRequest,
    @Param() params: unknown,
    @Body() body: unknown,
  ) {
    const item = new CartItemRequest({
      ...(body as object),
      bookId: new StorefrontIdRequest(params, 'bookId').id,
    });
    return this._shopping.updateItem(
      request.authenticatedUser!.id,
      item.bookId,
      item.quantity,
    );
  }

  @Delete('cart/items/:bookId')
  public removeItem(
    @Req() request: AuthenticatedRequest,
    @Param() params: unknown,
  ) {
    return this._shopping.removeItem(
      request.authenticatedUser!.id,
      new StorefrontIdRequest(params, 'bookId').id,
    );
  }

  @Post('checkout')
  public checkout(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this._shopping.checkout(
      request.authenticatedUser!.id,
      new CheckoutRequest(body).input,
    );
  }

  @Get('orders')
  public orders(@Req() request: AuthenticatedRequest) {
    return this._shopping.orders(request.authenticatedUser!.id);
  }

  @Post('exchanges')
  public exchange(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this._shopping.requestExchange(
      request.authenticatedUser!.id,
      new CustomerExchangeRequest(body).input,
    );
  }

  @Get('recommendations')
  public recommendations(
    @Req() request: AuthenticatedRequest,
    @Query() query: unknown,
  ) {
    return this._shopping.recommendations(
      request.authenticatedUser!.id,
      new CatalogQueryRequest(query).context,
    );
  }
}
