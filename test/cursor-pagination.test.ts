import { MongoMemoryServer } from "mongodb-memory-server";
import { connect, disconnect, Types } from "mongoose";
import { PostModel } from "./schema/post.schema";
import { UserDocument, UserModel } from "./schema/user.schema";

describe('cursor-pagination', () => {
    let mongod: MongoMemoryServer;
    let users: UserDocument[] = [];

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        await connect(mongod.getUri());
    });

    beforeEach(async () => {
        users = [];

        for(let i=0; i<123; i++) {
            users.push(await UserModel.create({
                name: `user${i}`,
                gender: Math.random() < 0.5 ? 'male' : 'female',
            }));
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

    it('커서가 존재하지 않을경우 스킵옵션이 존재해도 처음부터 가져와야함', async () => {
        const { items } = (await UserModel.cursorPagination({
            limit: 10,
            skipCursor: true,
            paginationField: '_id',
        }))[0];

        items.forEach((item, idx) => {
            expect(item._id.toString()).toBe(users[idx]._id.toString());
            expect(item.gender).toBe(users[idx].gender);
            expect(item.name).toBe(users[idx].name);
        });
    });

    it('커서가 존재할때 skipCursor옵션에따라 커서를 스킵하거나 포함해 가져와야함', async () => {
        const cursorIndex = 10;
        const [paginatedCursorSkip , paginatedCursorInclude] = await Promise.all([
            UserModel.cursorPagination({limit: 10, skipCursor: true, paginationField: '_id', cursor: {_id: users[cursorIndex]._id}}),
            UserModel.cursorPagination({limit: 10, skipCursor: false, paginationField: '_id', cursor: {_id: users[cursorIndex]._id}}),
        ]);
        const cursorSkippedItems = paginatedCursorSkip[0].items;
        const cursorIncludedItems = paginatedCursorInclude[0].items;

        cursorSkippedItems.forEach((item, idx) => {
            expect(item._id.toString()).toBe(users[cursorIndex+1+idx]._id.toString());
            expect(item.gender).toBe(users[cursorIndex+1+idx].gender);
            expect(item.name).toBe(users[cursorIndex+1+idx].name);
        });
        cursorIncludedItems.forEach((item, idx) => {
            expect(item._id.toString()).toBe(users[cursorIndex+idx]._id.toString());
            expect(item.gender).toBe(users[cursorIndex+idx].gender);
            expect(item.name).toBe(users[cursorIndex+idx].name);
        });
    });

    it('limit이 양수가 아닐 때 역순으로 가져와야함', async () => {
        const cursorIndex = 20;
        const { items } = (await UserModel.cursorPagination({limit: -10, skipCursor: true, paginationField: '_id', cursor: {_id: users[cursorIndex]._id}}))[0];

        items.forEach((item, idx) => {
            const userIndex = cursorIndex-(10-idx);

            expect(item._id.toString()).toBe(users[userIndex]._id.toString());
            expect(item.gender).toBe(users[userIndex].gender);
            expect(item.name).toBe(users[userIndex].name);
        });
    });

    it('커서가 _id가 아닐경우 주어진 필드로 1차 정렬 후 _id로 2차정렬해 가져와야함', async () => {
        const sortedUsers = users.sort((a, b) => {
            if(a.gender < b.gender) return -1;
            if(a.gender > b.gender) return 1;
            if(a._id.toString() < b._id.toString()) return -1;
            if(a._id.toString() < b._id.toString()) return 1;
            return 0;
        });
        const cursorIndex = 10;
        const { items } = (await UserModel.cursorPagination({
            limit: -10,
            skipCursor: true,
            paginationField: 'gender',
            cursor: {gender: sortedUsers[cursorIndex].gender, _id: sortedUsers[cursorIndex]._id},
        }))[0];

        items.forEach((item, idx) => {
            expect(item._id.toString()).toBe(sortedUsers[cursorIndex-10+idx]._id.toString());
            expect(item.gender).toBe(sortedUsers[cursorIndex-10+idx].gender);
            expect(item.name).toBe(sortedUsers[cursorIndex-10+idx].name)
        });
    });

    it('총 데이터 개수를 반환해야함', async () => {
        const { cursorPaginatedInfo } = (await UserModel.cursorPagination({
            limit: 1,
            paginationField: '_id',
            skipCursor: true,
        }))[0];

        expect(cursorPaginatedInfo.totalCount).toBe(123);
    });
});