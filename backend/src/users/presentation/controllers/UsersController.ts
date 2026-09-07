import {
  Body,
  Patch,
  HttpCode,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Email } from 'src/shared/domain/vo/Email';
import { AddUserDto } from '../../application/dto/AddUserDto';
import { USER_USE_CASES } from '../../application/usecases/UserUseCases';
import type { UserUseCases } from '../../application/usecases/UserUseCases';
import { AddUserRequest } from '../requests/AddUserRequest';

import { UpdatePasswordDto } from '../../application/dto/UpdatePasswordDto';
import { UpdatePasswordRequest } from '../requests/UpdatePasswordRequest';

@Controller('users')
export class UsersController {
  public constructor(
    @Inject(USER_USE_CASES) private readonly useCases: UserUseCases,
  ) {}

  @Post()
  public add(@Body() body: unknown) {
    const request = new AddUserRequest(body);
    return this.useCases.add.execute(
      new AddUserDto(new Email(request.emailAddress), request.type),
    );
  }

  @Patch(':id/password')
  @HttpCode(204)
  public updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
  ): Promise<void> {
    const request = new UpdatePasswordRequest(body);
    return this.useCases.updatePassword.execute(
      new UpdatePasswordDto(id, request.password, request.passwordConfirmation),
    );
  }

  @Get(':id')
  public findById(@Param('id', ParseIntPipe) id: number) {
    return this.useCases.findById.execute(id);
  }
}
