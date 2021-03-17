import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
  AllowNull,
  HasMany,
  ForeignKey,
} from 'sequelize-typescript';

import { Video } from './video.entity';
import { Subtitles } from './subtitle.entity';

@Table
export class VideoSubtitles extends Model {
  forEach(arg0: (subtitle: any) => void): Error {
    console.log(arg0);
    throw new Error('Method not implemented.');
  }
  filter(arg0: (subtitle: any) => boolean): Error {
    console.log(arg0);
    throw new Error('Method not implemented.');
  }
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @ForeignKey(() => Video)
  @Column(DataType.INTEGER)
  videoId: number;

  @Column(DataType.STRING)
  lang: string;

  @HasMany(() => Subtitles, { onDelete: 'CASCADE' })
  subtitles: Subtitles;

  dataValues: VideoSubtitles;
}
