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
import { Video } from './video.entity';

@Table
export class Snippet extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @ForeignKey(() => Video)
  @Column(DataType.INTEGER)
  videoId: number;

  @Column(DataType.TEXT)
  title: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.STRING)
  channelId: string;

  @Column(DataType.TEXT)
  channelTitle: string;

  @Column(DataType.TEXT)
  cover: string;

  @Column(DataType.JSONB)
  thumbnails: {
    default: {
      url: string;
      width: number;
      height: number;
    };
    medium: {
      url: string;
      width: number;
      height: number;
    };
    high: {
      url: string;
      width: number;
      height: number;
    };
  };

  @Column(DataType.TEXT)
  liveBroadcastContent: string;

  @Column(DataType.DATE)
  publishedAt: Date;
}
