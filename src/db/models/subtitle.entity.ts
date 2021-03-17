import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
  AllowNull,
  ForeignKey,
} from 'sequelize-typescript';
import { VideoSubtitles } from './video-subtitles.entity';

@Table({
  timestamps: false,
})
export class Subtitles extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @ForeignKey(() => VideoSubtitles)
  @Column(DataType.INTEGER)
  videoSubtitleId: number;

  @Column(DataType.INTEGER)
  startTime: number;

  @Column(DataType.INTEGER)
  endTime: number;

  @Column(DataType.TEXT)
  text: string;
}
