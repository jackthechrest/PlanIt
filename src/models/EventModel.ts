import { Event } from '../entities/Event';
import { AppDataSource } from '../dataSource';
import { getUserById } from './UserModel';

const eventRepository = AppDataSource.getRepository(Event);

async function addNewEvent(
  eventID: string,
  startDate: Date,
  stopDate: Date,
  currentUserID: string
): Promise<Event | null> {
  // Create the new event object
  const currentUser = await getUserById(currentUserID);

  let newEvent = new Event();
  newEvent.eventID = eventID.substring(0, 100);
  newEvent.startDate = startDate;
  newEvent.stopDate = stopDate;
  const description = 'Hello';
  const location = 'College';
  const visibilityLevel = 'public';
  newEvent.description = description;
  newEvent.location = location;
  newEvent.visibility_level = visibilityLevel;
  newEvent.owner = currentUser;

  console.log(newEvent);

  newEvent = await eventRepository.save(newEvent);

  return newEvent;
}

export { addNewEvent };
