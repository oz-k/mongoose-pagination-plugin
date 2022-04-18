import { Aggregate, Document, Model, PipelineStage, Types } from "mongoose";
import { DocumentWithId } from './module';
export interface CursorPaginatedInfo {
    totalCount: number;
}

export interface CursorPaginatedResult<T> {
    cursorPaginatedInfo: CursorPaginatedInfo;
    items: T[];
}


type Schema<T extends Document> = Omit<T, keyof Omit<Document, '_id'>>;
export type CursorPaginationOptions<T extends Document> = {
    [K in keyof Schema<T>]: {
        skipCursor: boolean;
        limit: number;
        paginationField: K;
        cursor?: {_id: Types.ObjectId} & {[key in K]: T[K]};
    };
}[keyof Schema<T>];

export function cursorPagination<T extends DocumentWithId>(
    paginationOptions: CursorPaginationOptions<T>,
    filterQueries: PipelineStage[] = [],
): Aggregate<CursorPaginatedResult<Omit<T, keyof DocumentWithId>>[]> {
    const model = this as Model<T>;
    const paginationField = paginationOptions.paginationField;
    const isLimitPositive = paginationOptions.limit > 0;
    const notSkipCursor = !paginationOptions.skipCursor;
    // limit이 양수면 grater, 아니면 less로 하고 커서를 스킵하지 않는다면 operator에 equal 조건을 추가해 커서도 포함하게함
    const comparisonOperator = `$${isLimitPositive ? 'g' : 'l'}t${notSkipCursor ? 'e' : ''}`;
    const sortValue = isLimitPositive ? 1 : -1;
    // 커서가 존재하고 스킵하겠다고할때만 스킵되게
    const cursorQuery = paginationOptions.cursor
        ? paginationField === '_id'
            // TODO: 현재는 1개의 subField만 지원하지만 추후 늘려도됨
            // _id가 넘치거나 같으면(커서포함) 검색됨
            ? {_id: {[comparisonOperator]: paginationOptions.cursor._id}}
            : {
                // 페이징필드가 넘치거나 페이징필드는 같은데 _id가 넘치거나 같으면(커서포함) 검색됨
                $or: [
                    // 스킵하지않으면 equal 조건이 추가되어있어 equal을 제거하기위해 slice함(equal을 제거하는이유는 아래 or문에서 equal검사를 하기때문)
                    {[paginationField]: {
                        [
                            notSkipCursor 
                                ? comparisonOperator.slice(0, -1)
                                : comparisonOperator
                        ]: paginationOptions.cursor[paginationField]}},
                    {
                        _id: {[comparisonOperator]: paginationOptions.cursor._id},
                        [paginationField]: {$eq: paginationOptions.cursor[paginationField]},
                    },
                ],
            }
        : {};

    return model.aggregate([
        ...filterQueries,
        {
            $facet: {
                items: [
                    {$match: cursorQuery},
                    {$sort: {[paginationField as string]: sortValue, _id: sortValue}},
                    {$limit: Math.abs(paginationOptions.limit)},
                ],
                totalCount: [{$count: 'count'}],
            },
        },
        {
            $project: {
                items: {
                    $cond: {
                        // 역으로 가져올경우 배열을 반대로바꿔 concat하기 편하게
                        if: !isLimitPositive,
                        then: {$reverseArray: '$items'},
                        else: '$items',
                    },
                },
                cursorPaginatedInfo: {
                    totalCount: {$ifNull: [{$first: '$totalCount.count'}, 0]},
                },
            },
        },
    ]);
}