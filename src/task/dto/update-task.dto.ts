import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends OmitType(PartialType(CreateTaskDto), [
  'userId',
] as const) {}
