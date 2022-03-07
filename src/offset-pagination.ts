import { PipelineStage, DocumentWithId, Model } from "mongoose";

//페이징요청 옵션
export interface IOffsetPaginationOption {
    page: number;
    limit: number;
}

//페이지정보
export interface IOffsetPaginatedInfo {
    totalCount: number;
}

//페이징처리 리턴타입
export interface IOffsetPaginatedResult<T> {
    offsetPaginatedInfo: IOffsetPaginatedInfo;
    items: T[];
}

export async function offsetPagination<T extends DocumentWithId>(
    paginationOption: IOffsetPaginationOption,
    filterQueries: PipelineStage[] = []
) {
    const model = this as Model<T>;
    const page = paginationOption.page >= 1 ? paginationOption.page : 1;
    const limit = paginationOption.limit;
    return (await model.aggregate<IOffsetPaginatedResult<Omit<T, keyof DocumentWithId>>>([
        ...filterQueries,
        {
            $facet: {
                items: [
                    {$skip: (page-1)*limit},
                    {$limit: limit}
                ],
                totalCount: [
                    {$count: 'count'}
                ]
            }
        }, {
            $project: {
                items: true,
                offsetPaginatedInfo: {
                    totalCount: {$ifNull: [{$first: '$totalCount.count'}, 0]}
                }
            }
        }
    ]))[0];
}