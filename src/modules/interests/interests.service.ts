import { HttpException, Inject, Injectable } from '@nestjs/common';
import { INTERESTS_REPOSITORY } from '../../globals/constants';
import { Repository, Sequelize } from 'sequelize-typescript';
import { Interests } from '../../db/models/interest.entity';
import { InterestsCreateDto, InterestsWithVideos } from './dto/interests.dto';

@Injectable()
export class InterestsService {
  constructor(
    @Inject(INTERESTS_REPOSITORY)
    private readonly interestsRepository: Repository<Interests>,
  ) {}

  async getAll(): Promise<{ interests: Interests[] }> {
    const interests = await this.interestsRepository.findAll({
      order: [Sequelize.literal('"Interests"."id"')],
    });
    return {
      interests,
    };
  }

  async getAllWithVideos(): Promise<InterestsWithVideos> {
    const res = await this.interestsRepository.sequelize.query(
      `select v."serviceId", v.duration, i.path, i.interest, i.id as interestId, s.title, 
        s.description, s.thumbnails, s.cover, v.clicks, v.priority from "Interests" i 
        join "VideoInterests" vi on i.id = vi."interestId" 
        join "Videos" v on vi."videoId" = v.id 
        join "Snippets" s on s."videoId" = v.id
        order by v.priority asc, v.clicks desc`,
    );

    const allInterestsWithVideos = {};
    const map = {};

    res[0].forEach((video: any) => {
      if ((video.path.length = 1)) {
        allInterestsWithVideos[video.interest] = [];
        map[video.path[0]] = video.interest;
      }
    });

    res[0].forEach((video: any) => {
      const globalInterest = map[video.path[0]];
      allInterestsWithVideos[globalInterest].push(video);
    });

    return allInterestsWithVideos;
  }

  // async mappingToTreeForClient(videos: any) {
  //   const result = {};
  //
  //   videos.forEach((video) => {
  //     const path = video.path;
  //     video.path.forEach((interest, index) => {
  //       if (!result[interest] && index === 0) {
  //         result[interest] = {};
  //       } else if (index === 1 && !result[path[0]][interest]) {
  //         result[path[0]][interest] = {};
  //       } else if (index === 2 && !result[path[0]][path[1]][interest]) {
  //         console.log('log');
  //         result[path[0]][path[1]][interest] = {};
  //       }
  //     });
  //   });
  //
  //   videos.forEach((video) => {
  //     const path = video.path;
  //     video.path.forEach((interest, index) => {
  //       if (index === 0) {
  //         result[interest] = {};
  //       } else if (index === 1) {
  //         result[path[0]][interest] = {};
  //       } else if (index === 2) {
  //         console.log('log');
  //         result[path[0]][path[1]][interest] = {};
  //       }
  //     });
  //   });
  //
  //   return result;
  // }

  async get(id: number): Promise<{ interests: Interests }> {
    const interests = await this.interestsRepository.findOne({ where: { id } });
    return {
      interests,
    };
  }

  async create(
    interest: InterestsCreateDto,
    userId: number,
  ): Promise<{ message: string; id: number; name: string }> {
    try {
      const { name, parent } = interest;
      const res: [{ id?: number }[], unknown] = await this.interestsRepository
        .sequelize.query(`
        INSERT INTO "Interests" (interest, path, "createdAt", "updatedAt", creator)
        values (
        '${name}',
        (SELECT path FROM "Interests" WHERE id = ${parent}) || (select currval('"Interests_id_seq"')::integer),
        (SELECT now()), (SELECT now()),
        '${userId}'
              )
              RETURNING id`);

      console.log(res);

      const { id } = res[0][0];
      return {
        message: 'INTEREST_WAS_CREATED',
        id,
        name: interest.name,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException('ERROR', 400);
    }
  }

  async getParents(id: number): Promise<Interests[]> {
    const res: any[] = await this.interestsRepository.sequelize.query(`
    SELECT * FROM "Interests"
    WHERE id != ${id}
    AND array[id] && (
    SELECT path
    FROM "Interests"
    WHERE id = ${id}
    )
    ORDER BY path;`);
    return res[0];
  }

  async getChildrens(id: number): Promise<Interests[]> {
    const res: any = await this.interestsRepository.sequelize.query(`
    SELECT * FROM "Interests"
    WHERE path && ARRAY[${id}]
    ORDER BY array_length(path, 1);`);
    return res[0];
  }

  async update(interest: {
    id: number;
    name: string;
  }): Promise<{ message: string }> {
    try {
      const res: any = await this.interestsRepository.sequelize.query(`
    UPDATE "Interests" SET "interest" = '${interest.name}', "updatedAt" = (SELECT now()) WHERE id = ${interest.id};
`);

      if (res[1].rowCount) {
        return { message: 'INTEREST_WAS_UPDATED' };
      }

      return { message: 'ERROR:INTEREST_WAS_NOT_UPDATED' };
    } catch (e) {
      console.log(e);
      return { message: 'ERROR:INTEREST_WAS_NOT_UPDATED' };
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const res: any = await this.interestsRepository.sequelize.query(`
    DELETE FROM "Interests"
    WHERE path && ARRAY[${id}];`);
      if (res[1].rowCount) {
        return { message: 'INTEREST_WAS_DELETED' };
      }
      return { message: 'ERROR:INTEREST_WAS_NOT_DELETED' };
    } catch (e) {
      console.log(e);
      return { message: 'ERROR:INTEREST_WAS_NOT_DELETED' };
    }
  }
}
