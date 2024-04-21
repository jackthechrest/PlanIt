import { AppDataSource } from '../dataSource';
import { getUserById } from './UserModel';
import { Follow } from '../entities/Follow';
import { createNewNotification } from './NotificationsModel';
import { Or, Like } from 'typeorm';

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
  newFollow.followId = `${targetedUserId}<+>${requestingUserId}`;
  newFollow.targetedUserId = targetedUserId;
  newFollow.targetedUsername = targetedUser.username;
  newFollow.targetedDisplayName = targetedUser.displayName;
  newFollow.targetedPictureOptions = targetedUser.pictureOptions;
  newFollow.targetedUser = targetedUser;
  newFollow.requestingUserId = requestingUserId;
  newFollow.requestingUsername = requestingUser.username;
  newFollow.requestingDisplayName = requestingUser.displayName;
  newFollow.requestingPictureOptions = requestingUser.pictureOptions;
  newFollow.requestingUser = requestingUser;

  // save newFollow before notifying and returning
  newFollow = await followRepository.save(newFollow);

  // send notification to targeted user
  await createNewNotification(targetedUserId, requestingUserId, "FOLLOW", `/users/${requestingUserId}`);
  
  return newFollow;
}

async function updateFollows(userId: string, displayName: string, profileBackground: ProfileColors, profileHead: ProfileColors, profileBody: ProfileColors): Promise<void> {
  const follows = await followRepository.findBy({ followId: Or(Like(`${userId}<+>%`), Like(`%<+>${userId}`))});

  for (const follow of follows) {
    if (userId === follow.requestingUserId) {
      if (displayName.length !== 0) {
        follow.requestingDisplayName = displayName;
      }

      if (profileBackground !== "no change") {
        follow.requestingPictureOptions[0] = profileBackground;
      }
    
      if (profileHead !== "no change") {
        follow.requestingPictureOptions[1] = profileHead;
      }
    
      if (profileBody !== "no change") {
        follow.requestingPictureOptions[2] = profileBody;
      }
    } else if (userId === follow.targetedUserId) {
      if (displayName.length !== 0) {
        follow.targetedDisplayName = displayName;
      }

      if (profileBackground !== "no change") {
        follow.targetedPictureOptions[0] = profileBackground;
      }
    
      if (profileHead !== "no change") {
        follow.targetedPictureOptions[1] = profileHead;
      }
    
      if (profileBody !== "no change") {
        follow.targetedPictureOptions[2] = profileBody;
      }
    }
    await followRepository.save(follow);
  }
}

async function removeFollow(requestingUserId: string, targetedUserId: string): Promise<void> {
  // delete
  const followId = `${targetedUserId}<+>${requestingUserId}`;

  await followRepository
    .createQueryBuilder('follow')
    .delete()
    .where('followId = :followId', { followId })
    .execute();
}

export { getFollowById, addFollow, updateFollows, removeFollow };