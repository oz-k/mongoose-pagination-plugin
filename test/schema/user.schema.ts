import { Document, model, Schema, Types } from "mongoose";
import { mongoosePaginationPlugin, PaginationModel } from "src";

export const User = new Schema<UserDocument>({
    name: {type: String},
    gender: {type: String, enum: ['male', 'female']},
}).plugin(mongoosePaginationPlugin);

export interface UserDocument extends Document<Types.ObjectId> {
    name: string;
    gender: 'male' | 'female';
}
export const UserModel = model('User', User) as PaginationModel<UserDocument>;