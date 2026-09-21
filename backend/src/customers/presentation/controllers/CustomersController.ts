import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { USERS_REPOSITORY } from 'src/users/domain/repositories/UserRepositoryTokens';
import type { UsersRepository } from 'src/users/domain/repositories/UsersRepository';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { CompleteCustomerProfile } from '../../application/usecases/CompleteCustomerProfile';
import { GetCustomerSelfProfile } from '../../application/usecases/GetCustomerSelfProfile';
import { CompleteCustomerProfileRequest } from '../requests/CompleteCustomerProfileRequest';
import { CustomerAddressRequest } from '../requests/CustomerAddressRequest';
import { CustomerCreditCardRequest } from '../requests/CustomerCreditCardRequest';
import { CustomerProfileIdRequest } from '../requests/CustomerProfileIdRequest';
import { UpdateCustomerCreditCardRequest } from '../requests/UpdateCustomerCreditCardRequest';
import { CUSTOMER_PROFILE_USE_CASES } from './CustomerProfileUseCases';
import type { CustomerProfileUseCases } from './CustomerProfileUseCases';
import { CUSTOMER_USE_CASES } from './CustomerUseCases';
import type { CustomerUseCases } from './CustomerUseCases';
import { CustomerFindAllRequest } from '../requests/CustomerFindAllRequest';
import { CustomerIdRequest } from '../requests/CustomerIdRequest';
import { UpdateCustomerRequest } from '../requests/UpdateCustomerRequest';

@Controller()
export class CustomersController {
  public constructor(
    @Inject(CUSTOMER_USE_CASES)
    private readonly _useCases: CustomerUseCases,
    @Inject(CUSTOMER_PROFILE_USE_CASES)
    private readonly _profiles: CustomerProfileUseCases,
    private readonly _getProfile: GetCustomerSelfProfile,
    private readonly _completeProfile: CompleteCustomerProfile,
    @Inject(USERS_REPOSITORY) private readonly _users: UsersRepository,
  ) {}

  @Get('admin/customers')
  public findAll(@Query() query: unknown) {
    return this._useCases.findAll(new CustomerFindAllRequest(query).search);
  }

  @Get('admin/customers/:id')
  public findById(@Param() params: unknown) {
    return this._useCases.findById(new CustomerIdRequest(params).id);
  }

  @Put('admin/customers/:id')
  public update(@Param() params: unknown, @Body() body: unknown) {
    const id = new CustomerIdRequest(params).id;
    return this._useCases.update(new UpdateCustomerRequest(id, body).toDto());
  }

  @Delete('admin/customers/:id')
  @HttpCode(204)
  public async delete(@Param() params: unknown): Promise<void> {
    await this._useCases.delete(new CustomerIdRequest(params).id);
  }

  @Get('admin/customers/:customerId/addresses')
  public addresses(@Param() params: unknown) {
    return this._profiles.listAddresses(
      new CustomerProfileIdRequest(params).customerId,
    );
  }

  @Post('admin/customers/:customerId/addresses')
  public addAddress(@Param() params: unknown, @Body() body: unknown) {
    return this._profiles.saveAddress(
      new CustomerProfileIdRequest(params).customerId,
      new CustomerAddressRequest(body).data,
    );
  }

  @Put('admin/customers/:customerId/addresses/:id')
  public updateAddress(@Param() params: unknown, @Body() body: unknown) {
    const ids = new CustomerProfileIdRequest(params, true);
    return this._profiles.saveAddress(
      ids.customerId,
      new CustomerAddressRequest(body).data,
      ids.id,
    );
  }

  @Delete('admin/customers/:customerId/addresses/:id')
  @HttpCode(204)
  public async deleteAddress(@Param() params: unknown): Promise<void> {
    const ids = new CustomerProfileIdRequest(params, true);
    await this._profiles.deleteAddress(ids.customerId, ids.id!);
  }

  @Get('admin/customers/:customerId/cards')
  public cards(@Param() params: unknown) {
    return this._profiles.listCards(
      new CustomerProfileIdRequest(params).customerId,
    );
  }

  @Post('admin/customers/:customerId/cards')
  public addCard(@Param() params: unknown, @Body() body: unknown) {
    return this._profiles.addCard(
      new CustomerProfileIdRequest(params).customerId,
      new CustomerCreditCardRequest(body).data,
    );
  }

  @Get('users/:userId/customer')
  public getSelf(@Param('userId', ParseIntPipe) userId: number) {
    return this._getProfile.execute(userId);
  }

  @Post('users/:userId/customer')
  public async completeSelf(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: unknown,
  ) {
    const user = await this._users.findById(userId);
    if (!user) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: userId });
    }
    return {
      customerId: await this._completeProfile.execute(
        userId,
        new CompleteCustomerProfileRequest(body, user.email.address).data,
      ),
    };
  }

  @Put('users/:userId/customer')
  public async updateSelf(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: unknown,
  ) {
    const customerId = await this.customerId(userId);
    return this._useCases.update(
      new UpdateCustomerRequest(customerId, body).toDto(),
    );
  }

  @Delete('users/:userId/customer')
  @HttpCode(204)
  public async deactivateSelf(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    await this._useCases.delete(await this.customerId(userId));
  }

  @Get('users/:userId/customer/addresses')
  public async selfAddresses(@Param('userId', ParseIntPipe) userId: number) {
    return this._profiles.listAddresses(await this.customerId(userId));
  }

  @Post('users/:userId/customer/addresses')
  public async addSelfAddress(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: unknown,
  ) {
    return this._profiles.saveAddress(
      await this.customerId(userId),
      new CustomerAddressRequest(body).data,
    );
  }

  @Put('users/:userId/customer/addresses/:id')
  public async updateSelfAddress(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
  ) {
    return this._profiles.saveAddress(
      await this.customerId(userId),
      new CustomerAddressRequest(body).data,
      id,
    );
  }

  @Delete('users/:userId/customer/addresses/:id')
  @HttpCode(204)
  public async deleteSelfAddress(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this._profiles.deleteAddress(await this.customerId(userId), id);
  }

  @Get('users/:userId/customer/cards')
  public async selfCards(@Param('userId', ParseIntPipe) userId: number) {
    return this._profiles.listCards(await this.customerId(userId));
  }

  @Post('users/:userId/customer/cards')
  public async addSelfCard(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: unknown,
  ) {
    return this._profiles.addCard(
      await this.customerId(userId),
      new CustomerCreditCardRequest(body).data,
    );
  }

  @Put('users/:userId/customer/cards/:id')
  public async updateSelfCard(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
  ) {
    return this._profiles.updateCard(
      await this.customerId(userId),
      id,
      new UpdateCustomerCreditCardRequest(body).data,
    );
  }

  @Delete('users/:userId/customer/cards/:id')
  @HttpCode(204)
  public async deleteSelfCard(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this._profiles.deleteCard(await this.customerId(userId), id);
  }

  private async customerId(userId: number): Promise<number> {
    const profile = await this._getProfile.execute(userId);
    if (!profile.customer) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: userId });
    }
    return profile.customer.id;
  }
}
