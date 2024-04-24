import { Request, Response } from 'express';
import { getUserById } from '../models/UserModel';
import { addNewEvent } from '../models/EventModel';
import { parseDatabaseError } from '../utils/db-utils';

async function registerEvent(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;

  if (!isLoggedIn) {
    res.redirect('/login');
  }

  const currentUser = await getUserById(authenticatedUser.userId);

  const {
    eventID,
    startYear,
    startMonth,
    startDay,
    startHour,
    startMinute,
    stopYear,
    stopMonth,
    stopDay,
    stopHour,
    stopMinute,
  } = req.body as EventRequest;
  console.log(startDay, startHour, startMinute);
  const startDate = new Date(startYear, startMonth - 1, startDay, startHour - 5, startMinute);
  const stopDate = new Date(stopYear, stopMonth - 1, stopDay, stopHour - 5, stopMinute);

  try {
    await addNewEvent(eventID, startDate, stopDate, currentUser.userId);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
  res.redirect(`/users/${authenticatedUser.userId}}/calendar`);
}

export { registerEvent };
