import { PipelineStage, Model, Aggregate } from "mongoose";
import { DocumentWithId } from './module'; 

//페이징요청 옵션
export interface OffsetPaginationOption {
    page: number;
    limit: number;
}

//페이지정보
export interface OffsetPaginatedInfo {
    totalCount: number;
}

//페이징처리 리턴타입
export interface OffsetPaginatedResult<T> {
    offsetPaginatedInfo: OffsetPaginatedInfo;
    items: T[];
}

export function offsetPagination<T extends DocumentWithId>(
    paginationOption: OffsetPaginationOption,
    filterQueries: PipelineStage[] = []
): Aggregate<OffsetPaginatedResult<Omit<T, keyof DocumentWithId>>[]> {
    const model = this as Model<T>;
    const page = paginationOption.page >= 1 ? paginationOption.page : 1;
    const limit = paginationOption.limit;

    return model.aggregate([
        ...filterQueries,
        {
            $facet: {
                items: [
                    {$skip: (page-1)*limit},
                    {$limit: limit}
                ],
                totalCount: [{$count: 'count'}],
            },
        },
        {
            $project: {
                items: true,
                offsetPaginatedInfo: {
                    totalCount: {$ifNull: [{$first: '$totalCount.count'}, 0]}
                }
            }
        }
    ]);
}