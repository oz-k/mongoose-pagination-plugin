import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { connect, disconnect } from "mongoose";
import { mongoosePaginationPlugin, IOffsetPaginationOption } from "src";
import { UserDocument, UserModel } from "./schema/user.schema";
import { PostDocument, PostModel } from "./schema/post.schema";

describe('offset-pagination', () => {
    let mongod: MongoMemoryServer;
    let defaultOption: IOffsetPaginationOption;
    let users: UserDocument[] = [];
    let posts: PostDocument[] = [];

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        await connect(mongod.getUri());
    });

    beforeEach(async () => {
        defaultOption = {
            page: 1,
            limit: 10
        }

        for(let i=0; i<123; i++) {
            users.push(await new UserModel({name: `user${i}`, gender: Math.random() < 0.5 ? 'male' : 'female'}).save());
            posts.push(await new PostModel({title: `post${i}`, writer: users[i]._id}).save());
        }
    });

    afterEach(async () => {
        await UserModel.deleteMany({});
        await PostModel.deleteMany({});
    })

    afterAll(async () => {
        await disconnect();
        await mongod?.stop();
    });

    it('해당 페이지의 데이터 반환', async () => {
        const { items } = await UserModel.offsetPagination(defaultOption);

        items.forEach((user, idx) => {
            idx = idx+(defaultOption.page-1)*defaultOption.limit;
            expect(user.name).toBe(users[idx].name)
            expect(user.gender).toBe(users[idx].gender);
        });
    });

    it('총 데이터 개수 반환', async () => {
        const { offsetPaginatedInfo } = await UserModel.offsetPagination(defaultOption);

        expect(offsetPaginatedInfo.totalCount).toBe(123);
    });
});