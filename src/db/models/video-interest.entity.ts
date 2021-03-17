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
import { Interests } from './interest.entity';
import { Video } from './video.entity';

@Table
export class VideoInterest extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @ForeignKey(() => Video)
  @Column(DataType.INTEGER)
  videoId: number;

  @AllowNull(false)
  @ForeignKey(() => Interests)
  @Column(DataType.INTEGER)
  interestId: number;
}
