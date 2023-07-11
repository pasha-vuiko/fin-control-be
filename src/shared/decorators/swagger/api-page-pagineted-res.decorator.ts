import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { PagePaginationResEntity } from '@shared/entities/page-pagination-res.entity';

export const ApiPagePaginatedRes = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
): MethodDecorator =>
  applyDecorators(
    ApiExtraModels(() => PagePaginationResEntity, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PagePaginationResEntity) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
              total: { type: 'number' },
              page: { type: 'number' },
              numOfItems: { type: 'number' },
            } satisfies ProduceConditionsMapper<PagePaginationResEntity<DataDto>>,
          },
        ],
      },
    }),
  );

type ProduceConditionsMapper<T> = {
  [K in keyof T]: any;
};
