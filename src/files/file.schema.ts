import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Automatically manage createdAt and updatedAt
export class FileModel extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ required: true })
  uploadedBy: string;

  @Prop({ default: null })
  sharedLink: string | null;
}

export const FileSchema = SchemaFactory.createForClass(FileModel);
export type FileDocument = FileModel & Document;
