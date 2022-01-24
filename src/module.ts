import 'mongoose';
// import { CursorFacetValueType, ICursorPaginationOption, ICursorPaginatedResult } from './cursor-pagination';
import { IOffsetPaginatedResult, IOffsetPaginationOption } from './offset-pagination';

declare module 'mongoose' {
    export interface PaginationModel<T extends DocumentWithId> extends Model<T> {
        offsetPagination(
            paginationOption: IOffsetPaginationOption,
            filterQueries?: PipelineStage[]
        ): Promise<IOffsetPaginatedResult<Omit<T, keyof DocumentWithId>>>;

        // cursorPagination<K extends keyof Exclude<T, DocumentWithId>>(
        //     paginationOption: ICursorPaginationOption<Exclude<T, DocumentWithId>, K>, 
        //     filterQueries?: CursorFacetValueType,
        // ): Promise<ICursorPaginatedResult<T, Exclude<T, DocumentWithId>[K]>>;
    }

    export type DocumentWithId<TQueryHelpers = any, DocType = any> = Document<Types.ObjectId, TQueryHelpers, DocType>; 
    export function model<T extends DocumentWithId>(
        name: string,
        schema?: Schema<T>,
        collection?: string,
        skipInit?: boolean
    ): PaginationModel<T>
}