import { Event } from '../entities/Event';
import { AppDataSource } from '../dataSource';
import { getUserById } from './UserModel';

const eventRepository = AppDataSource.getRepository(Event);

async function getEventById(eventID: string): Promise<Event | null> {
  const event = await eventRepository.findOne({ where: { eventID }, relations: ['owner', 'joinedUsers', 'bannedUsers', 'invitedUsers'] });
  return event;
}

async function addNewEvent(
  eventName: string,
  startDate: Date,
  stopDate: Date,
  description: string,
  location: string,
  visibilityLevel: EventVisibility,
  currentUserID: string
): Promise<Event | null> {
  // Create the new event object
  const currentUser = await getUserById(currentUserID);

  let newEvent = new Event();
  newEvent.eventName = eventName.substring(0, 100);
  newEvent.startDate = startDate;
  newEvent.stopDate = stopDate;
  newEvent.description = description.substring(0, 100);
  newEvent.location = location;
  newEvent.visibilityLevel = visibilityLevel;
  newEvent.owner = currentUser;

  newEvent = await eventRepository.save(newEvent);

  return newEvent;
}

async function getEventStatusForUser(eventID: string, userID: string): Promise<EventStatus> {
  const event = await getEventById(eventID);

  if (event.owner.userId === userID) {
    return "OWNER";
  }

  for (const user of event.joinedUsers) {
    if (user.userId === userID) {
      return "JOINED";
    }
  }

  for (const user of event.bannedUsers) {
    if (user.userId === userID) {
      return "BANNED";
    }
  }

  for (const user of event.invitedUsers) {
    if (user.userId === userID) {
      return "INVITED";
    }
  }

  return "NONE";
}

async function addUserToEvent(eventID: string, userID: string): Promise<void> {
  const event = await getEventById(eventID);

  event.joinedUsers.push(await getUserById(userID));

  await eventRepository.save(event);
}

async function removeUserFromEvent(eventID: string, userID: string): Promise<void> {
  const event = await getEventById(eventID);

  let pendingIndex = -1;
  let indexValue = -1;

  for (const user of event.joinedUsers) {
    ++indexValue;
    if (user.userId === userID) {
        pendingIndex = indexValue;
        break;
    }
  }

  if (pendingIndex !== -1) {
    event.joinedUsers.splice(pendingIndex, 1);
    await eventRepository.save(event);
  }
}

async function banUserFromEvent(eventID: string, userID: string): Promise<void> {
  const event = await getEventById(eventID);

  event.bannedUsers.push(await getUserById(userID));

  await eventRepository.save(event);
}

async function unbanUserFromEvent(eventID: string, userID: string): Promise<void> {
  const event = await getEventById(eventID);

  let pendingIndex = -1;
  let indexValue = -1;

  for (const user of event.bannedUsers) {
    ++indexValue;
    if (user.userId === userID) {
        pendingIndex = indexValue;
        break;
    }
  }

  if (pendingIndex !== -1) {
    event.bannedUsers.splice(pendingIndex, 1);
    await eventRepository.save(event);
  }
}

async function inviteUserToEvent(eventID: string, userID: string): Promise<void> {
  const event = await getEventById(eventID);

  event.invitedUsers.push(await getUserById(userID));

  await eventRepository.save(event);
}

async function uninviteUserFromEvent(eventID: string, userID: string): Promise<void> {
  const event = await getEventById(eventID);

  let pendingIndex = -1;
  let indexValue = -1;

  for (const user of event.invitedUsers) {
    ++indexValue;
    if (user.userId === userID) {
        pendingIndex = indexValue;
        break;
    }
  }

  if (pendingIndex !== -1) {
    event.invitedUsers.splice(pendingIndex, 1);
    await eventRepository.save(event);
  }
}

export { addNewEvent, getEventById, getEventStatusForUser, addUserToEvent, removeUserFromEvent, 
          banUserFromEvent, unbanUserFromEvent, inviteUserToEvent, uninviteUserFromEvent };
