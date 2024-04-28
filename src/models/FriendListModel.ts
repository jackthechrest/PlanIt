import { getUserById } from './UserModel';
import { AppDataSource } from '../dataSource';
import { FriendList } from '../entities/FriendList';
import { createNewNotification, setResponded } from './NotificationsModel';
import { removeFollow } from './FollowModel';

const friendListRepository = AppDataSource.getRepository(FriendList);

async function getFriendListById(friendListId: string): Promise<FriendList | null> {
    const friendList = await friendListRepository.findOne({ where: { friendListId }, 
        relations: [
        'owner',
        'friends',
        'pendingFriends',
        'blockedUsers',
        ],
    });

    return friendList;
}

async function getFriendStatus(requestingUserId: string, targetedUserId: string): Promise<FriendStatus> {
    const requestingUser = await getUserById(requestingUserId);
    const targetedUser = await getUserById(targetedUserId);

    for (const blockedFriendList of requestingUser.blockedFriendLists) {
        if (blockedFriendList.friendListId === targetedUser.selfFriendList.friendListId) {
            return "THEY BLOCKED";
        }
    }

    for (const blockedFriendList of targetedUser.blockedFriendLists) {
        if (blockedFriendList.friendListId === requestingUser.selfFriendList.friendListId) {
            return "I BLOCKED";
        }
    }

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
    // get requesting user's friend list
    const requestingFriendList = await getFriendListById(`FL<+>${requestingUserId}`);

    // add targeted user to requesting user pending friend list
    requestingFriendList.pendingFriends.push(await getUserById(targetedUserId));

    // save updated pending friendlist
    await friendListRepository.save(requestingFriendList);

    // get targeted user's friend list and add requested user to it
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

    // mark friend requests as responded to
    await setResponded(requestingUserId, targetedUserId);
    await setResponded(targetedUserId, requestingUserId);
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

        // save updated friendlist
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

        // save updated friendlist
        await friendListRepository.save(requestingFriendList);
    }
}

async function blockUserById(requestingUserId: string, targetedUserId: string): Promise<void> {
    // remove all connections (follows, friends, pending friends)
    await removeFollow(requestingUserId, targetedUserId);
    await removeFollow(targetedUserId, requestingUserId);
    await removeFriend(requestingUserId, targetedUserId);
    await replyFriendRequest(requestingUserId, targetedUserId, "DECLINE");
    await replyFriendRequest(targetedUserId, requestingUserId, "DECLINE");

    // add targeted user to requesting user's block list
    const requestingFriendList = await getFriendListById(`FL<+>${requestingUserId}`);
    const targetedUser = await getUserById(targetedUserId);

    for (const entry of requestingFriendList.blockedUsers) {
        if (entry.userId === targetedUserId) {
            return;
        }
    }

    requestingFriendList.blockedUsers.push(targetedUser);
    await friendListRepository.save(requestingFriendList);
}

async function unblockUserById(requestingUserId: string, targetedUserId: string): Promise<void> {
    const requestingFriendList = await getFriendListById(`FL<+>${requestingUserId}`);

    let pendingIndex = -1;
    let indexValue = -1;

    for (const entry of requestingFriendList.blockedUsers) {
        ++indexValue;
        if (entry.userId === targetedUserId) {
            pendingIndex = indexValue;
            break;
        }
    }

    if (pendingIndex !== -1) {
        requestingFriendList.blockedUsers.splice(pendingIndex, 1)

        // save updated list of blocked users
        await friendListRepository.save(requestingFriendList);
    }
}

async function removeFriendListData(requestingUserId: string): Promise<void> {
    const requestingFriendList = await getFriendListById(`FL<+>${requestingUserId}`);

    for (const targetedFriend of requestingFriendList.friends) {
        await removeFriend(requestingUserId, targetedFriend.userId);
    }

    for (const targetedPendingFriend of requestingFriendList.pendingFriends) {
        await replyFriendRequest(requestingUserId, targetedPendingFriend.userId, "DECLINE")
    }
}

export { getFriendListById, getFriendStatus, sendFriendRequest, replyFriendRequest, removeFriend, 
         blockUserById, unblockUserById, removeFriendListData };
