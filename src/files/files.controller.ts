import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';
import * as fs from 'fs';

import { FilesService } from './files.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = join(__dirname, '..', 'uploads');
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExt = extname(file.originalname);
          const fileName = `${file.fieldname}-${uniqueSuffix}${fileExt}`;
          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow only images and videos
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'video/mp4',
          'video/avi',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      limits: {
        fileSize: 250 * 1024 * 1024,
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new NotFoundException('Invalid file type.');
    }

    const uploadedBy = user.sub;
    return this.filesService.saveFileMetadata(file, uploadedBy);
  }

  @Get('user/:userId')
  async getUserFiles(@Param('userId') userId: string) {
    return this.filesService.getFilesByUser(userId);
  }

  @Post(':fileId/share')
  async generateSharedLink(@Param('fileId') fileId: string) {
    return this.filesService.generateSharedLink(fileId);
  }

  @Public()
  @Get('shared/:sharedLink')
  async getFileBySharedLink(
    @Param('sharedLink') sharedLink: string,
    @Res() res: Response,
  ) {
    const file = await this.filesService.getFileBySharedLink(sharedLink);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return res.sendFile(file.path, { root: './' });
  }

  @Get('my-files')
  async listMyFiles(@CurrentUser() user: JwtPayload) {
    const userId = user.sub;
    const files = await this.filesService.listFilesByUser(userId);
    return { files };
  }

  @Get(':id')
  async getFileById(@Param('id') id: string) {
    const file = await this.filesService.getFileById(id);
    return { file };
  }

  @Get('uploads/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.sendFile(filePath);
  }
}
