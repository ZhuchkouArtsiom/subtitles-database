import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
  Unique,
  HasMany,
  HasOne,
  ForeignKey,
  AllowNull,
} from 'sequelize-typescript';

import { VideoSubtitles } from './video-subtitles.entity';
import { Snippet } from './snippet.entity';
import { VideoInterest } from './video-interest.entity';
import { Editor } from './editor.entity';

@Table
export class Video extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Unique
  @Column(DataType.STRING)
  serviceId: string;

  @Column(DataType.STRING)
  tag: string;

  @Column(DataType.STRING)
  etag: string;

  @Column(DataType.INTEGER)
  wordsPerMinute: number;

  @Column(DataType.INTEGER)
  duration: number;

  @Column(DataType.INTEGER)
  clicks: number;

  @Column(DataType.INTEGER)
  priority: number;

  @Column(DataType.STRING)
  level: string;

  @ForeignKey(() => Editor)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  creator: number;

  @HasMany(() => VideoSubtitles, { onDelete: 'CASCADE' })
  videoSubtitles: VideoSubtitles;

  @HasMany(() => VideoInterest, { onDelete: 'CASCADE' })
  videoInterest: VideoInterest;

  @HasOne(() => Snippet, { onDelete: 'CASCADE' })
  snippet: Snippet;

  dataValues: Video;
}
