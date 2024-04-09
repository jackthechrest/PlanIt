import { getUserById } from './UserModel';
import { AppDataSource } from '../dataSource';
import { FriendList } from '../entities/FriendList';
import { createNewNotification } from './NotificationsModel';

const friendListRepository = AppDataSource.getRepository(FriendList);

async function getFriendListById(friendListId: string): Promise<FriendList | null> {
    const friendList = await friendListRepository.findOne({ where: { friendListId }, 
        relations: [
        'owner',
        'friends',
        'pendingFriends',
        ],
    });

    return friendList;
}

async function getFriendStatus(requestingUserId: string, targetedUserId: string): Promise<FriendStatus> {
    const requestingUser = await getUserById(requestingUserId);
    const targetedUser = await getUserById(targetedUserId);

    for (const unconfirmedFriendList of requestingUser.unconfirmedFriendLists) {
        if (unconfirmedFriendList.friendListId === targetedUser.selfFriendList.friendListId) {
            return "PENDING";
        }
    }

    for (const friendList of requestingUser.otherFriendLists) {
        if (friendList.friendListId === targetedUser.selfFriendList.friendListId) {
            return "FRIEND";
        }
    }

    return "NOT FRIEND";
}

async function sendFriendRequest(requestingUserId: string, targetedUserId: string): Promise<void> {
    // get targeted user's friend list
    const targetedFriendList = await getFriendListById(`FL<+>${targetedUserId}`);
    targetedFriendList.pendingFriends.push(await getUserById(requestingUserId));

    // save updated pending friendlist
    await friendListRepository.save(targetedFriendList);

    // get users, send notification to targeted user
    const targetedUser = await getUserById(targetedUserId);
    const requestingUser = await getUserById(requestingUserId);

    await createNewNotification(targetedUser, requestingUser, "FRIEND REQUEST SENT", `/users/${targetedUserId}`)
}

async function replyFriendRequest(requestingUserId: string, targetedUserId: string, action: FriendRequestAction): Promise<void> {
    const requestingFriendList = await getFriendListById(`FL<+>${requestingUserId}`);

    let pendingIndex = 0;

    for (const entry of requestingFriendList.pendingFriends) {
        if (entry.userId === targetedUserId) {
            break;
        } else {
            pendingIndex++;
        }
    }

    const requestingUser = await getUserById(requestingUserId);
    const targetedUser = await getUserById(targetedUserId);

    if (pendingIndex !== -1) {
        requestingFriendList.pendingFriends.splice(pendingIndex, 1)

        if (action === "ACCEPT") {
            requestingFriendList.friends.push(targetedUser)
        }
        requestingFriendList.friends.splice(pendingIndex, 1)
        // save updated pending friendlist
        await friendListRepository.save(requestingFriendList);

        // send notification to requestingUser if accepted
        if (action === "ACCEPT") {
            await createNewNotification(targetedUser, requestingUser, "FRIEND REQUEST ACCEPTED", `/users/${targetedUserId}`);
        }
    }
}

export { getFriendListById, getFriendStatus, sendFriendRequest, replyFriendRequest };
