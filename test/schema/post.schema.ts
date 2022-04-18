import { Document, model, Schema, Types } from "mongoose";
import { mongoosePaginationPlugin, PaginationModel } from "src";
import { UserDocument } from "./user.schema";

export const Post = new Schema<PostDocument>({
    title: {type: String},
    writer: {type: Schema.Types.ObjectId, ref: 'User'}
}).plugin(mongoosePaginationPlugin);

export interface PostDocument extends Document<Types.ObjectId> {
    title: string;
    writer: UserDocument;
}
export const PostModel = model('Post', Post) as PaginationModel<PostDocument>;