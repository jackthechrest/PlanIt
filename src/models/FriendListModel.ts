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
    const requestingFriendList = await getFriendListById(`FL<+>${requestingUserId}`);
    requestingFriendList.pendingFriends.push(await getUserById(targetedUserId));

    // save updated pending friendlist
    await friendListRepository.save(requestingFriendList);

    // get targeted user's friend list
    const targetedFriendList = await getFriendListById(`FL<+>${targetedUserId}`);
    targetedFriendList.pendingFriends.push(await getUserById(requestingUserId));

    // save updated pending friendlist
    await friendListRepository.save(targetedFriendList);

    await createNewNotification(targetedUserId, requestingUserId, "FRIEND REQUEST SENT", `/users/${requestingUserId}`)

}

async function replyFriendRequest(requestingUserId: string, targetedUserId: string, action: FriendRequestAction): Promise<void> {
    const requestingFriendList = await getFriendListById(`FL<+>${requestingUserId}`);

    let pendingIndex = -1;
    let indexValue = -1;

    for (const entry of requestingFriendList.pendingFriends) {
        ++indexValue;
        if (entry.userId === targetedUserId) {
            pendingIndex = indexValue;
            break;
        }
    }

    const targetedUser = await getUserById(targetedUserId);

    if (pendingIndex !== -1) {
        requestingFriendList.pendingFriends.splice(pendingIndex, 1)

        if (action === "ACCEPT") {
            requestingFriendList.friends.push(targetedUser)
        }

        // save updated pending friendlist
        await friendListRepository.save(requestingFriendList);

        if (action === "ACCEPT") {
            await createNewNotification(targetedUserId, requestingUserId, "FRIEND REQUEST ACCEPTED", `/users/${requestingUserId}`);
        }
    }

    const targetedFriendList = await getFriendListById(`FL<+>${targetedUserId}`);

    pendingIndex = -1;
    indexValue = -1;

    for (const entry of targetedFriendList.pendingFriends) {
        ++indexValue;
        if (entry.userId === requestingUserId) {
            pendingIndex = indexValue;
            break;
        }
    }

    const requestingUser = await getUserById(requestingUserId);

    if (pendingIndex !== -1) {
        targetedFriendList.pendingFriends.splice(pendingIndex, 1)

        if (action === "ACCEPT") {
            targetedFriendList.friends.push(requestingUser)
        }

        // save updated pending friendlist
        await friendListRepository.save(targetedFriendList);
    }
}

async function removeFriend(requestingUserId: string, targetedUserId: string): Promise<void> {
    const targetedFriendList = await getFriendListById(`FL<+>${targetedUserId}`);

    let pendingIndex = -1;
    let indexValue = -1;

    for (const entry of targetedFriendList.friends) {
        ++indexValue;
        if (entry.userId === requestingUserId) {
            pendingIndex = indexValue;
            break;
        }
    }

    if (pendingIndex !== -1) {
        targetedFriendList.friends.splice(pendingIndex, 1)

        // save updated pending friendlist
        await friendListRepository.save(targetedFriendList);
    }

    const requestingFriendList = await getFriendListById(`FL<+>${requestingUserId}`);

    pendingIndex = -1;
    indexValue = -1;

    for (const entry of requestingFriendList.friends) {
        ++indexValue;
        if (entry.userId === targetedUserId) {
            pendingIndex = indexValue;
            break;
        }
    }

    if (pendingIndex !== -1) {
        requestingFriendList.friends.splice(pendingIndex, 1)

        // save updated pending friendlist
        await friendListRepository.save(requestingFriendList);
    }
}


export { getFriendListById, getFriendStatus, sendFriendRequest, replyFriendRequest, removeFriend };
