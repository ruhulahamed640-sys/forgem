import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import {
  AiChatDto,
  AiExplainTopicDto,
  AiSummarizeDto,
  GenerateAiStudyPlanDto,
} from './dto/ai.dto';

@ApiTags('AI Study Assistant')
@ApiBearerAuth()
@Throttle({ default: { limit: 20, ttl: 60_000 } })
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a prompt to the provider-independent AI study assistant' })
  chat(@CurrentUser() user: AuthenticatedUser, @Body() dto: AiChatDto) {
    return this.aiService.chat(user.id, dto);
  }

  @Post('generate-study-plan')
  @ApiOperation({ summary: 'Generate, validate, and persist an AI-optimized study plan' })
  generatePlan(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateAiStudyPlanDto,
  ) {
    return this.aiService.generateValidatedStudyPlan(user.id, dto);
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Summarize study notes or chapter materials' })
  summarize(@CurrentUser() user: AuthenticatedUser, @Body() dto: AiSummarizeDto) {
    return this.aiService.summarize(user.id, dto);
  }

  @Post('explain-topic')
  @ApiOperation({ summary: 'Generate an academic explanation for a topic or assignment concept' })
  explainTopic(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AiExplainTopicDto,
  ) {
    return this.aiService.explainTopic(user.id, dto);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Retrieve current daily AI token usage and remaining plan quota' })
  getUsage(@CurrentUser() user: AuthenticatedUser) {
    return this.aiService.getUsage(user.id);
  }
}
