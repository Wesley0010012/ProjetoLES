import { Body, Controller, Post, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from 'src/users/presentation/middlewares/TokenValidationMiddleware';
import { AskAssistantInputDto } from '../../application/dto/input/AskAssistantInputDto';
import { AskAssistant } from '../../application/usecases/AskAssistant';
import { AssistantMessageRequest } from '../requests/AssistantMessageRequest';

@Controller('assistant')
export class AssistantController {
  public constructor(private readonly _assistant: AskAssistant) {}

  @Post('messages')
  public ask(@Body() body: unknown, @Req() request: AuthenticatedRequest) {
    const message = new AssistantMessageRequest(body);
    return this._assistant.execute(
      new AskAssistantInputDto(request.authenticatedUser!.id, message.message),
    );
  }
}
