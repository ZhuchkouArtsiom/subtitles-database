import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  Unique,
  HasMany,
} from 'sequelize-typescript';
import { VideoInterest } from './video-interest.entity';
import { Editor } from './editor.entity';

@Table
export class Interests extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.ARRAY(DataType.INTEGER))
  path: number[];

  @AllowNull(false)
  @Column(DataType.TEXT)
  interest: string;

  @HasMany(() => VideoInterest)
  videoInterest: VideoInterest;

  @ForeignKey(() => Editor)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  creator: number;
}
