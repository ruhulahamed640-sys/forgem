import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GeminiAiProvider } from '../../integrations/ai/gemini.provider';
import { FallbackAiProvider } from '../../integrations/ai/fallback-ai.provider';

@Module({
  controllers: [AiController],
  providers: [AiService, GeminiAiProvider, FallbackAiProvider],
  exports: [AiService, GeminiAiProvider, FallbackAiProvider],
})
export class AiModule {}
