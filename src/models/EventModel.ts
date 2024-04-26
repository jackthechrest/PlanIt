import { Event } from '../entities/Event';
import { AppDataSource } from '../dataSource';
import { getUserById } from './UserModel';

const eventRepository = AppDataSource.getRepository(Event);

async function getEventById(eventID: string): Promise<Event | null> {
  return await eventRepository.findOne({ where: { eventID }, relations: ['owner', 'joinedUsers'] });
}

async function addNewEvent(
  eventName: string,
  startDate: Date,
  stopDate: Date,
  currentUserID: string
): Promise<Event | null> {
  // Create the new event object
  const currentUser = await getUserById(currentUserID);

  let newEvent = new Event();
  newEvent.eventName = eventName.substring(0, 100);
  newEvent.startDate = startDate;
  newEvent.stopDate = stopDate;
  const description = 'Hello';
  const location = 'College';
  const visibilityLevel = 'PUBLIC';
  newEvent.description = description;
  newEvent.location = location;
  newEvent.visibilityLevel = visibilityLevel;
  newEvent.owner = currentUser;

  newEvent = await eventRepository.save(newEvent);

  return newEvent;
}

export { addNewEvent, getEventById };
