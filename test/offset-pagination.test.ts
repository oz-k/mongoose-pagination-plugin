import { MongoMemoryServer } from "mongodb-memory-server";
import { connect, disconnect } from "mongoose";
import { OffsetPaginationOption } from 'src/offset-pagination';
import { PostDocument, PostModel } from "./schema/post.schema";
import { UserDocument, UserModel } from "./schema/user.schema";

describe('offset-pagination', () => {
    let mongod: MongoMemoryServer;
    let defaultOption: OffsetPaginationOption;
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

        users = [];
        posts = [];

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

    it('해당 페이지의 데이터를 반환해야함', async () => {
        const { items } = (await UserModel.offsetPagination(defaultOption))[0];

        items.forEach((user, idx) => {
            idx = idx+(defaultOption.page-1)*defaultOption.limit;
            expect(user.name).toBe(users[idx].name)
            expect(user.gender).toBe(users[idx].gender);
        });
    });

    it('총 데이터 개수를 반환해야함', async () => {
        const { offsetPaginatedInfo } = (await UserModel.offsetPagination(defaultOption))[0];

        expect(offsetPaginatedInfo.totalCount).toBe(123);
    });
});