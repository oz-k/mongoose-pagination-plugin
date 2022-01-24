import { Schema } from 'mongoose';
// import { cursorPagination } from './cursor-pagination';
import { offsetPagination } from './offset-pagination';

export function mongoosePaginationPlugin(schema: Schema) {
    schema.statics.offsetPagination = offsetPagination;
    // schema.statics.cursorPagination = cursorPagination;
}