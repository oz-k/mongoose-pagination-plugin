// import { Types, PipelineStage, Model, SortValues, DocumentWithId } from "mongoose";

// export enum SortValue {
//     asc = '$gt',
//     desc = '$lt'
// }

// export interface ICursorPaginationOption<T, K extends keyof T> {
//     //가져올 아이템 개수
//     limit: number;

//     //커서 값
//     cursor?: T[K];

//     //정렬할 필드명이 _id가 아닐 경우 필요한 서브커서
//     subCursor?: K extends '_id' ? null : Types.ObjectId;

//     //정렬할 필드명
//     paginator: K;
    
//     //정렬기준
//     sort: SortValue;

//     //커서기준 다음걸 가져올건지 이전걸 가져올건지 여부
//     isNext: boolean;
// }

// //페이지정보타입
// export interface ICursorPaginatedInfo<C> {
//     //시작커서 값
//     startCursor: C;
//     //마지막커서 값
//     endCursor: C;

//     //이전페이지 존재 여부
//     hasPrevPage: boolean;
//     //다음페이지 존재 여부
//     hasNextPage: boolean;
// }

// //페이징처리 리턴타입
// export interface ICursorPaginatedResult<T, C> {
//     cursorPaginatedInfo: ICursorPaginatedInfo<C>;
//     items: T[];
// }

// export type CursorFacetValueType = Exclude<PipelineStage.Facet['$facet'][string], PipelineStage.Sort>;

// /**
//  * 커서기반 페이징
//  * @param paginationOption 페이징 옵션
//  * @param filterQueries 필터옵션
//  * @returns 페이징처리된 아이템
//  */
// export function cursorPagination<T extends DocumentWithId, K extends keyof Omit<T, keyof DocumentWithId>>(
//     paginationOption: ICursorPaginationOption<Omit<T, keyof DocumentWithId>, K>, 
//     filterQueries: CursorFacetValueType = [],
// ): ICursorPaginatedResult<Omit<T, keyof DocumentWithId>, Omit<T, keyof DocumentWithId>[K]> {
//     const model = this as Model<T>;

//     if(paginationOption.paginator === '_id' && )

//     const sortQuery = {
//         [paginationOption.paginator]: paginationOption.sort,
//         _id: paginationOption.sort
//     }
    
//     const cursorQuery = {
//         ...filterQueries,
//         $or: [
//             {
//                 //커서기준 다음 혹은 이전값을 추림
//                 [paginationOption.paginator]: {
//                     [SortValue[paginationOption.sort]]: paginationOption.cursor ? 
//                 }
//             },
//             {
//                 //커서와 같은 경우 _id를 기준으로 추림
//                 [paginationOption.paginator]: {
//                     $eq: paginationOption.cursor
//                 },
//                 _id: {
//                     [SortValue[paginationOption.sort]]: paginationOption.cursor
//                 }
//             }
//         ]
//     }
// }

// class A {
//     _id: Types.ObjectId;
//     createdAt: Date;
// }
// type ADoc = A & DocumentWithId;
// cursorPagination<ADoc, >({limit: 1, paginator: '_id', sort: "asc", cursor: '', next: true})