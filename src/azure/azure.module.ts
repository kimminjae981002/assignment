import { Module } from '@nestjs/common';
import { AzureService } from './azure.service';
import { AzureOpenAIService } from './azure-openai.service';

@Module({
  providers: [AzureService, AzureOpenAIService],
  exports: [AzureService, AzureOpenAIService],
})
export class AzureModule {}
