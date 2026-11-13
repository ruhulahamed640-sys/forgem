import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { TopicsController } from './topics.controller';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  imports: [SubjectsModule],
  controllers: [ChaptersController, TopicsController],
  providers: [ChaptersService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
