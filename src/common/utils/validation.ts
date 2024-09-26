import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

export const validateDocumentExists = <T = any>(
  model: Model<T>,
  document: T | null,
) => {
  if (!document) {
    throw new NotFoundException(`${model.name} not found`);
  }
};
