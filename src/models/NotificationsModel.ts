import { Not } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { Notifications } from '../entities/Notifications';
import { getUserById } from './UserModel';
import { hasUnreadReports } from './ReportModel';
import { hasUnreadMessageThreads } from './MessageThreadModel';

const notificationsRepository = AppDataSource.getRepository(Notifications);

// get all the notifications that aren't messages or reports, update opened/read status
async function getAllOtherNotificationsForUserId(userId: string): Promise<Notifications[]> {
  await notificationsRepository
    .createQueryBuilder('notifications')
    .leftJoinAndSelect('notifications.receivingUser', 'receivingUser')
    .update(Notifications)
    .set({ beenRead: true })
    .where({ beenOpened: true })
    .andWhere('receivingUser.userId = :userId', {userId})
    .andWhere('type <> \'MESSAGE\'')
    .andWhere('type <> \'REPORT\'')
    .execute();

  await notificationsRepository
    .createQueryBuilder('notifications')
    .leftJoinAndSelect('notifications.receivingUser', 'receivingUser')
    .update(Notifications)
    .set({ beenOpened: true })
    .where({ beenOpened: false })
    .andWhere('receivingUser.userId = :userId', {userId})
    .andWhere('type <> \'MESSAGE\'')
    .andWhere('type <> \'REPORT\'')
    .execute();

  const notifications = await notificationsRepository.find({ where: { receivingUserId: userId, type: Not('MESSAGE' || 'REPORT'),}, order: {secondsSinceEnoch: "DESC"}});

  return notifications;
}

async function createNewNotification(receivingUserId: string, sendingUserId: string, type: NotificationType, link: void | string): Promise<Notifications | null> {
  // delete any previous duplicate notifications
  await notificationsRepository
    .createQueryBuilder('notifications')
    .delete()
    .where({ receivingUserId })
    .andWhere({ sendingUserId })
    .andWhere({ type })
    .execute();

  // get users
  const receiver = await getUserById(receivingUserId);
  const sender = await getUserById(sendingUserId);

  // create new notifcation
  let newNotification = new Notifications();
  newNotification.type = type;
  newNotification.dateSent = new Date();
  newNotification.dateString = newNotification.dateSent.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit', timeZone: 'America/Chicago'});
  newNotification.secondsSinceEnoch = newNotification.dateSent.getTime() / 1000;
  newNotification.receivingUser = receiver;
  newNotification.receivingUserId = receiver.userId;
  newNotification.sendingUser = sender;
  newNotification.sendingUserId = sender.userId;
  newNotification.sendingUsername = sender.username;
  newNotification.sendingDisplayName = sender.displayName;
  newNotification.sendingPictureOptions = sender.pictureOptions;
  

  // no link for warning or event cancelled notifications
  if (link) {
    newNotification.link = link;
  }

  newNotification = await notificationsRepository.save(newNotification);

  return newNotification;
}

async function getNotification(receivingUserId: string, sendingUserId: string, type: NotificationType): Promise<Notifications | null> {
  return await notificationsRepository.findOne({where: {receivingUserId, sendingUserId, type, respondedTo : false}})
}

async function setResponded(receivingUserId: string, sendingUserId: string): Promise<void> {
  await notificationsRepository
    .createQueryBuilder('notifications')
    .update(Notifications)
    .set({ respondedTo: true })
    .where('receivingUserId = :receivingUserId', { receivingUserId })
    .andWhere('sendingUserId = :sendingUserId', { sendingUserId })
    .andWhere({ type: "FRIEND REQUEST SENT" })
    .execute();
}

async function hasUnreadNotifications(userId: string): Promise<boolean> {
  const notifications = await notificationsRepository.find({ where: { receivingUserId: userId, beenOpened: false, type: Not('MESSAGE' || 'REPORT'),}});

  if (notifications.length !== 0) {
    return true;
  }

  const hasMessages = await hasUnreadMessageThreads(userId);

  if (hasMessages) {
    return true;
  }

  const user = await getUserById(userId)

  if (user && user.isAdmin) {
    const hasReports = await hasUnreadReports();
    if (hasReports) {
      return true;
    }
  }

  return false;
}

async function updateNotifications(userId: string, displayName: string, profileBackground: ProfileColors, profileHead: ProfileColors, profileBody: ProfileColors): Promise<void> {
  const notifications = await notificationsRepository.find({where: {sendingUserId: userId}});

  for (const notification of notifications) {
    if (displayName.length !== 0) {
      notification.sendingDisplayName = displayName;
    }

    if (profileBackground !== "no change") {
      notification.sendingPictureOptions[0] = profileBackground;
    }
    
    if (profileHead !== "no change") {
      notification.sendingPictureOptions[1] = profileHead;
    }
    
    if (profileBody !== "no change") {
      notification.sendingPictureOptions[2] = profileBody;
    }
    await notificationsRepository.save(notification);
  }
}

export { getAllOtherNotificationsForUserId, createNewNotification, getNotification, setResponded, hasUnreadNotifications, updateNotifications };