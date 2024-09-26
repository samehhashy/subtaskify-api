import { TaskSummaryDto } from './task-summary.dto';

export class PaginatedTasksDto {
  tasks: TaskSummaryDto[];
  total: number;
}
