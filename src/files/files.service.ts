import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';

import { FileDocument, FileModel } from './file.schema';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(FileModel.name) private fileModel: Model<FileDocument>,
  ) {}

  async saveFileMetadata(file: Express.Multer.File, uploadedBy: string) {
    const newFile = new this.fileModel({
      filename: file.filename,
      path: `uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy,
    });
    return newFile.save();
  }

  async getFilesByUser(userId: string) {
    return this.fileModel.find({ uploadedBy: userId }).exec();
  }

  async generateSharedLink(fileId: string) {
    const file = await this.fileModel.findById(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const sharedLink = randomBytes(16).toString('hex');
    file.sharedLink = sharedLink;
    await file.save();
    return { sharedLink };
  }

  async getFileBySharedLink(sharedLink: string) {
    const file = await this.fileModel.findOne({ sharedLink }).exec();
    if (file) {
      file.viewCount += 1;
      await file.save();
    }
    return file;
  }

  async listFilesByUser(userId: string): Promise<FileModel[]> {
    return this.fileModel.find({ uploadedBy: userId }).exec();
  }
  async getFileById(fileId: string): Promise<FileModel> {
    const file = await this.fileModel.findById(fileId).exec();
    if (!file) throw new NotFoundException('File not found');
    return file;
  }
}
