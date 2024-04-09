import { AppDataSource } from '../dataSource';
import { Notifications } from '../entities/Notifications';
import { User } from '../entities/User';

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
  
  const notifications = await notificationsRepository
    .createQueryBuilder('notifications')
    .leftJoinAndSelect('notifications.receivingUser', 'receivingUser')
    .where('receivingUser.userId = :userId', {userId})
    .andWhere('type <> \'MESSAGE\'')
    .andWhere('type <> \'REPORT\'')
    .execute();

  return notifications;
}

async function createNewNotification(receiver: User, sender: User, type: NotificationType, link: null | string): Promise<Notifications | null> {
  let newNotification = new Notifications();
  newNotification.type = type;
  newNotification.dateSent = new Date();
  newNotification.dateString = newNotification.dateSent.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit'});
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