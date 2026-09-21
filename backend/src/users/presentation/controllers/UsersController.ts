import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Request } from 'src/shared/presentation/requests/Request';
import { SignUpInput } from '../../application/dto/SignUpInput';
import { SignInDto } from '../../application/dto/SignInDto';
import { UpdatePasswordDto } from '../../application/dto/UpdatePasswordDto';
import { CreateDemoSession } from '../../application/usecases/CreateDemoSession';
import { SignIn } from '../../application/usecases/SignIn';
import { USER_USE_CASES } from '../../application/usecases/UserUseCases';
import type { UserUseCases } from '../../application/usecases/UserUseCases';
import { SESSION_MANAGER } from '../../application/protocols/SessionManager';
import type { SessionManager } from '../../application/protocols/SessionManager';
import { UserType } from '../../domain/enums/UserType';
import { UpdatePasswordRequest } from '../requests/UpdatePasswordRequest';

class AuthenticationRequest extends Request {
  public constructor(body: unknown) {
    super(body);
  }
  public get emailAddress() {
    return this.email('email');
  }
  public get password() {
    return this.string('password');
  }
  public get confirmation() {
    return this.string('passwordConfirmation');
  }
  public get type() {
    return this.enumValue('type', Object.values(UserType));
  }
}

@Controller()
export class UsersController {
  public constructor(
    private readonly demo: CreateDemoSession,
    @Inject(SESSION_MANAGER)
    private readonly session: SessionManager,
    private readonly signIn: SignIn,
    @Inject(USER_USE_CASES) private readonly useCases: UserUseCases,
  ) {}

  @Post('auth/demo-session') public demoSession(@Body() body: unknown) {
    return this.demo.execute(new AuthenticationRequest(body).type);
  }

  @Post('auth/sign-in') public login(@Body() body: unknown) {
    const request = new AuthenticationRequest(body);
    return this.signIn.execute(
      new SignInDto(request.emailAddress, request.password, request.type),
    );
  }

  @Post('auth/sign-up') public async register(@Body() body: unknown) {
    const request = new AuthenticationRequest(body);
    const user = await this.useCases.signUp.executeEntity(
      new SignUpInput(
        request.emailAddress,
        request.password,
        request.confirmation,
      ),
    );
    return this.session.issue(user);
  }

  @Post('auth/sign-out') @HttpCode(204) public logout(
    @Headers('authorization') header: string,
  ) {
    this.session.remove(header?.replace(/^Bearer\s+/i, '') ?? '');
  }

  @Patch('users/:id/password') @HttpCode(204) public updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
  ): Promise<void> {
    const request = new UpdatePasswordRequest(body);
    return this.useCases.updatePassword.execute(
      new UpdatePasswordDto(id, request.password, request.passwordConfirmation),
    );
  }

  @Get('users/:id') public findById(@Param('id', ParseIntPipe) id: number) {
    return this.useCases.findById.execute(id);
  }
}
