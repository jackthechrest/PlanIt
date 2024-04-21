import { AppDataSource } from '../dataSource';
import { FriendList } from '../entities/FriendList';
import { User } from '../entities/User';
import { VerifyCode } from '../entities/VerifyCode';
import { removeFriendListData } from './FriendListModel';
import { removeMessageThreadData } from './MessageThreadModel';

const userRepository = AppDataSource.getRepository(User);

async function getUserById(userId: string): Promise<User | null> {
  const user = await userRepository.findOne({ where: { userId }, 
    relations: [
    'following',
    'followers',
    'receivedNotifications', 
    'selfFriendList',
    'otherFriendLists',
    'unconfirmedFriendLists',
    'blockedFriendLists',
    'code',
    ],
  });

  return user;
}

async function getUserByUsername(username: string): Promise<User | null> {
  const user = await userRepository.findOne({ where: { username }, 
    relations: [
    'following',
    'followers',
    'receivedNotifications', 
    'selfFriendList',
    'otherFriendLists',
    'unconfirmedFriendLists',
    'blockedFriendLists',
    'code',
    ],
  });

  return user;
}

async function getUserByEmail(email: string): Promise<User | null> {
  const user = await userRepository
    .createQueryBuilder('user')
    .where('email = :email', { email })
    .getOne();
  return user;
}

async function addNewUser(username: string, displayName: string, email: string, passwordHash: string): Promise<User | null> { 
  // Create the new user object
  let newUser = new User();
  newUser.username = username.substring(0, 100);;
  newUser.displayName = displayName.substring(0, 100);;
  newUser.email = email;
  newUser.passwordHash = passwordHash;
  newUser.pictureOptions = ["blue", "green", "green"];

  if (username === 'JackTheChrest' || username === 'Quinn' || username === 'Matthew') {
    newUser.isAdmin = true;
  }
  newUser = await userRepository.save(newUser);

  const friendList = new FriendList();
  friendList.friendListId = `FL<+>${newUser.userId}`;

  newUser.selfFriendList = friendList;

  const verifyCode = new VerifyCode();
  verifyCode.codeId = `VC<+>${newUser.userId}`;

  newUser.code = verifyCode;
  
  newUser = await userRepository.save(newUser);

  return newUser;
}

async function deleteUserById(userId: string): Promise<void> {
  await removeMessageThreadData(userId);
  await removeFriendListData(userId);

  await userRepository
    .createQueryBuilder('user')
    .delete()
    .where('userId = :userId', { userId })
    .execute();
}

async function setVerifiedByUserId(userId: string): Promise<User | null> {
  const updatedUser = await getUserById(userId);
  updatedUser.verifiedEmail = true;

  await userRepository
    .createQueryBuilder('user')
    .update(User)
    .set({ verifiedEmail: true })
    .where('userId = :userId', { userId })
    .execute();

  return updatedUser;
}

async function incrementWarningCountForUser(userId: string): Promise<User | null> {
  let updatedUser = await getUserById(userId);
  updatedUser.warningCount += 1;

  updatedUser = await userRepository.save(updatedUser);

  return updatedUser;
}

async function updateProfile(userId: string, displayName: string, biography: string, profileBackground: ProfileColors, profileHead: ProfileColors, profileBody: ProfileColors): Promise<boolean> {
  let updatedUser = await getUserById(userId);
  let wasUpdated = false;

  if (displayName.length !== 0) {
    updatedUser.displayName = displayName;
    wasUpdated = true;
  }

  if (biography.length !== 0) {
    updatedUser.biography = biography;
    wasUpdated = true;
  }

  if (profileBackground !== "no change") {
    updatedUser.pictureOptions[0] = profileBackground;
    wasUpdated = true;
  }

  if (profileHead !== "no change") {
    updatedUser.pictureOptions[1] = profileHead;
    wasUpdated = true;
  }

  if (profileBody !== "no change") {
    updatedUser.pictureOptions[2] = profileBody;
    wasUpdated = true;
  }

  updatedUser = await userRepository.save(updatedUser);

  return wasUpdated;
}

async function removeFriendData(userId: string): Promise<void> {
  const requestingUser = await getUserById(userId);
  let indexValue = -1;

  for (const targetedFriendList of requestingUser.otherFriendLists) {
    indexValue = -1;
    let targetedUser = await getUserById(targetedFriendList.friendListId.split('FL<+>')[1]);
    for (const friendList of targetedUser.otherFriendLists) {
            ++indexValue;
            if (friendList.friendListId === requestingUser.selfFriendList.friendListId) {
                targetedUser.otherFriendLists.splice(indexValue, 1)
                await userRepository.save(targetedUser);
            }
            break;
        }
    }

    for (const targetedPendingFriendList of requestingUser.unconfirmedFriendLists) {
        indexValue = -1;
        let targetedUser = await getUserById(targetedPendingFriendList.friendListId.split('FL<+>')[1]);
        for (const pendingFriendList of targetedUser.unconfirmedFriendLists) {
            ++indexValue;
            if (pendingFriendList.friendListId === requestingUser.selfFriendList.friendListId) {
                targetedUser.unconfirmedFriendLists.splice(indexValue, 1)
                await userRepository.save(targetedUser);
            }
            break;
        }
    }
}

export { getUserById, getUserByUsername, getUserByEmail, addNewUser, 
         deleteUserById, setVerifiedByUserId, updateProfile, incrementWarningCountForUser, removeFriendData };