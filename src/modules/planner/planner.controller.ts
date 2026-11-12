import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlannerService } from './planner.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/api-response.interface';
import { CreateStudyPlanDto } from './dto/planner.dto';

@ApiTags('Study Planner')
@ApiBearerAuth()
@Controller('planner')
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve student study plans and tasks with missed-task detection' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.plannerService.listPlans(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a daily or weekly study plan with scheduled tasks' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateStudyPlanDto) {
    return this.plannerService.createPlan(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a study plan or reschedule targets' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: Partial<CreateStudyPlanDto>,
  ) {
    return this.plannerService.updatePlan(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a study plan' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.plannerService.deletePlan(user.id, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a study plan task or goal and recalculate progress' })
  complete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.plannerService.completePlanTask(user.id, id);
  }
}
