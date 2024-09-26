import { Document } from 'mongoose';

export class TaskSummaryDto extends Document {
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority?: number;
}
