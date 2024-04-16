import { AppDataSource } from '../dataSource';
import { FriendList } from '../entities/FriendList';
import { User } from '../entities/User';
import { VerifyCode } from '../entities/VerifyCode';

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
  const user = await userRepository
    .createQueryBuilder('user')
    .where('username = :username', { username })
    .getOne();
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

export { getUserById, getUserByUsername, getUserByEmail, addNewUser, deleteUserById, setVerifiedByUserId, incrementWarningCountForUser };