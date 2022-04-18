import { Aggregate, Document, Model, PipelineStage, Types } from 'mongoose';
import { CursorPaginatedResult, CursorPaginationOptions } from './cursor-pagination';
import { OffsetPaginatedResult, OffsetPaginationOption } from './offset-pagination';

export type DocumentWithId<TQueryHelpers = any, DocType = any> = Document<Types.ObjectId, TQueryHelpers, DocType>; 
export interface PaginationModel<T extends DocumentWithId> extends Model<T> {
    offsetPagination(
        paginationOption: OffsetPaginationOption,
        filterQueries?: PipelineStage[],
    ): Aggregate<OffsetPaginatedResult<Omit<T, keyof Omit<DocumentWithId, '_id'>>>[]>;

    cursorPagination(
        paginationOption: CursorPaginationOptions<T>, 
        filterQueries?: PipelineStage[],
    ): Aggregate<CursorPaginatedResult<Omit<T, keyof Omit<DocumentWithId, '_id'>>>[]>;
}