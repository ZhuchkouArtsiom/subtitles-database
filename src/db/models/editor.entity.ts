import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
  AllowNull,
  Unique,
  HasMany,
} from 'sequelize-typescript';
import { Video } from './video.entity';
import { Interests } from './interest.entity';

@Table
export class Editor extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  key: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  name: string;

  @HasMany(() => Video)
  video: Video;

  @HasMany(() => Interests)
  interest: Interests;
}
