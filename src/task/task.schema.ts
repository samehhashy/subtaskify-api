import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import Mongoose, { HydratedDocument } from 'mongoose';
import { TaskSummaryDto } from './dto/task-summary.dto';

export type TaskDocument = HydratedDocument<Task>;

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

@Schema({ versionKey: 'version' })
export class Task {
  @Prop({ required: true, type: Mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  dueDate?: Date;

  @Prop({ type: Number, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority?: TaskPriority;

  @Prop({ required: true, default: false })
  completed: boolean;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: undefined,
  })
  parentId?: string;

  @Prop({
    type: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    default: undefined,
  })
  subtasks?: TaskSummaryDto[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
