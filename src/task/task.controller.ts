import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.schema';
import { PaginatedTasksDto } from './dto/paginated-tasks.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.taskService.createTask(createTaskDto);
  }

  @Get(':id')
  async getTaskDetails(@Param('id') id: string): Promise<Task> {
    return await this.taskService.getTaskDetails(id);
  }

  @Get('user/:userId')
  async getUserTasks(
    @Param('userId') userId: string,
  ): Promise<PaginatedTasksDto> {
    return await this.taskService.getUserTasks(userId);
  }

  @Patch(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return await this.taskService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<Task> {
    return await this.taskService.deleteTask(id);
  }
}
