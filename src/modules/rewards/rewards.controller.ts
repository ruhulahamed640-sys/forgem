import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { RedeemRewardDto } from './dto/reward.dto';

@ApiTags('Rewards')
@ApiBearerAuth()
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  @ApiOperation({ summary: 'List available rewards in catalog' })
  listCatalog() {
    return this.rewardsService.listCatalog();
  }

  @Get('achievements')
  @ApiOperation({ summary: 'List unlocked achievements for current user' })
  listAchievements(@CurrentUser() user: AuthenticatedUser) {
    return this.rewardsService.listUserAchievements(user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Retrieve immutable point transaction ledger and redemption history' })
  getHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.rewardsService.getRewardHistory(user.id);
  }

  @Post(':id/redeem')
  @ApiOperation({ summary: 'Redeem a catalog reward using verified point balance (idempotent)' })
  redeem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') rewardId: string,
    @Body() dto: RedeemRewardDto,
  ) {
    return this.rewardsService.redeemReward(user.id, rewardId, dto);
  }
}
