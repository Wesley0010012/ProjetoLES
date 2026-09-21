import { Module } from '@nestjs/common';
import { MetadataController } from './presentation/controllers/MetadataController';
import { APP_FILTER } from '@nestjs/core';
import { ScryptAdapter } from './infrastructure/cryptography/ScryptAdapter';
import { DefaultExceptionFilter } from './infrastructure/filters/DefaultExceptionFilter';
import { MESSAGE_TRANSLATOR } from './application/protocols/translations/MessageTranslator';
import { DefaultMessageTranslator } from './infrastructure/translations/DefaultMessageTranslator';

@Module({
  controllers: [MetadataController],
  providers: [
    ScryptAdapter,
    {
      provide: MESSAGE_TRANSLATOR,
      useClass: DefaultMessageTranslator,
    },
    {
      provide: APP_FILTER,
      useClass: DefaultExceptionFilter,
    },
  ],
  exports: [ScryptAdapter],
})
export class SharedModule {}
