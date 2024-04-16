import { Not } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { Notifications } from '../entities/Notifications';
import { getUserById } from './UserModel';

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

async function createNewNotification(receivingUserId: string, sendingUserId: string, type: NotificationType, link: null | string): Promise<Notifications | null> {
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
  newNotification.dateString = newNotification.dateSent.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit'});
  newNotification.secondsSinceEnoch = newNotification.dateSent.getTime() / 1000;
  newNotification.receivingUser = receiver;
  newNotification.receivingUserId = receiver.userId;
  newNotification.receivingUsername = receiver.username;
  newNotification.sendingUser = sender;
  newNotification.sendingUserId = sender.userId;
  newNotification.sendingUsername = sender.username;

  // no link for warning or event cancelled notifications
  if (link) {
    newNotification.link = link;
  }

  newNotification = await notificationsRepository.save(newNotification);

  return newNotification;
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

export { getAllOtherNotificationsForUserId, createNewNotification, setResponded };