import { Event } from '../entities/Event';
import { AppDataSource } from '../dataSource';
import { getUserById } from './UserModel';

const eventRepository = AppDataSource.getRepository(Event);

async function addNewEvent(
  eventName: string,
  startDate: Date,
  stopDate: Date,
  currentUserId: string
): Promise<Event | null> {
  // Create the new event object
  const currentUser = await getUserById(currentUserId);

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

  console.log(newEvent);

  newEvent = await eventRepository.save(newEvent);

  return newEvent;
}

async function getEventById(eventId: string): Promise<Event | null> {
  return await eventRepository.findOne({where: { eventId}, relations: ['owner', 'joinedUsers'] });
}

export { addNewEvent, getEventById };
