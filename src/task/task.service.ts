import { ConflictException, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TaskDocument, Task } from './task.schema';
import { Model } from 'mongoose';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserService } from 'src/user/user.service';
import { validateDocumentExists } from 'src/common/utils/validation';
import { PaginatedTasksDto } from './dto/paginated-tasks.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private readonly userService: UserService,
  ) {}

  private async validateUser(userId: string): Promise<void> {
    await this.userService.findOne(userId);
  }

  private async findOne(id: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).exec();
    validateDocumentExists(this.taskModel, task);
    return task;
  }

  private async createOne(task: Partial<Task>): Promise<TaskDocument> {
    await this.validateUser(task.userId);
    const createdTask = new this.taskModel({
      ...task,
      subtasks: task.parentId ? undefined : [],
    });
    return await createdTask.save();
  }

  private async addSubtaskToParent(
    subtask: TaskDocument,
    parentId: string,
  ): Promise<TaskDocument> {
    const parent = await this.findOne(parentId);
    if (parent.parentId) {
      throw new ConflictException('Cannot add subtask to another subtask');
    }
    return await this.taskModel.findByIdAndUpdate(
      parentId,
      { $push: { subtasks: subtask._id } },
      { new: true },
    );
  }

  private async moveTask(
    task: TaskDocument,
    newParentId?: string,
  ): Promise<TaskDocument> {
    const oldParentId = task.parentId;

    if (newParentId) {
      await this.addSubtaskToParent(task, newParentId);
      if (!!task.subtasks?.length) {
        await this.taskModel.deleteMany({ parentId: task._id }).exec();
      }
      task.subtasks = undefined;
    } else {
      task.subtasks = [];
    }

    if (oldParentId) {
      await this.taskModel
        .findByIdAndUpdate(oldParentId, { $pull: { subtasks: task._id } })
        .exec();
    }

    task.parentId = newParentId || undefined;
    return await task.save();
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    const createdTask = await this.createOne(createTaskDto);
    if (createdTask.parentId) {
      await this.addSubtaskToParent(createdTask, createdTask.parentId);
    }
    return await createdTask.save();
  }

  async updateTask(
    id: string,
    { parentId: newParentId, ...updateTaskDto }: UpdateTaskDto,
  ): Promise<TaskDocument> {
    const currentTask = await this.findOne(id);

    if (newParentId !== undefined && newParentId !== currentTask.parentId) {
      await this.moveTask(currentTask, newParentId);
    }

    return await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .exec();
  }

  async getUserTasks(userId: string): Promise<PaginatedTasksDto> {
    await this.validateUser(userId);
    const userTasks = await this.taskModel
      .find({ userId, parentId: null })
      .populate('subtasks', 'title completed dueDate priority')
      .exec();
    return {
      tasks: userTasks,
      total: userTasks ? userTasks.length : 0,
    };
  }

  async getTaskDetails(id: string): Promise<TaskDocument> {
    const task = await this.findOne(id);
    if (!!task.subtasks?.length) {
      return await task.populate('subtasks');
    }
    return task;
  }

  async deleteTask(id: string): Promise<TaskDocument> {
    const taskToDelete = await this.findOne(id);
    if (!!taskToDelete.subtasks.length) {
      await this.taskModel.deleteMany({ parentId: id }).exec();
    }
    return await this.taskModel.findByIdAndDelete(id).exec();
  }
}
