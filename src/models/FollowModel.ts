import { AppDataSource } from '../dataSource';
import { getUserById } from './UserModel';
import { Follow } from '../entities/Follow';
import { createNewNotification } from './NotificationsModel';

const followRepository = AppDataSource.getRepository(Follow);

async function getFollowById(followId: string): Promise<Follow | null> {
  return await followRepository.findOne({
    where: { followId },
  });
}

async function addFollow(requestingUserId: string, targetedUserId: string): Promise<Follow> {
  // Get users
  const requestingUser = await getUserById(requestingUserId);
  const targetedUser = await getUserById(targetedUserId);

  // update requesting user's following and targeted user's followers
  let newFollow = new Follow();
  newFollow.followId = targetedUserId + requestingUserId;
  newFollow.targetedUserId = targetedUserId;
  newFollow.targetedUsername = targetedUser.username;
  newFollow.targetedUser = targetedUser;
  newFollow.requestingUserId = requestingUserId;
  newFollow.requestingUsername = requestingUser.username;
  newFollow.requestingUser = requestingUser;

  // save newFollow before notifying and returning
  newFollow = await followRepository.save(newFollow);

  // send notification to targeted user
  await createNewNotification(targetedUserId, requestingUserId, "FOLLOW", `/users/${requestingUserId}`);
  
  return newFollow;
}

async function removeFollow(requestingUserId: string, targetedUserId: string): Promise<void> {
  // delete
  const followId = targetedUserId + requestingUserId;

  await followRepository
    .createQueryBuilder('follow')
    .delete()
    .where('followId = :followId', { followId })
    .execute();
}

export { getFollowById, addFollow, removeFollow };