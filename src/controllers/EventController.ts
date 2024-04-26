import { Request, Response } from 'express';
import { getUserById } from '../models/UserModel';
import { addNewEvent, getEventById } from '../models/EventModel';
import { parseDatabaseError } from '../utils/db-utils';

async function renderEvent(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetEventId } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const targetEvent = await getEventById(targetEventId);

  if (!targetEvent) {
    res.redirect(`/users/${authenticatedUser.userId}`); // user not found
    return;
  }

  const viewingUser = await getUserById(authenticatedUser.userId);
  const owningUser = targetEvent.owner;

  res.render('event', { event: targetEvent, viewingUser, owningUser });
}

async function registerEvent(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;

  if (!isLoggedIn) {
    res.redirect('/login');
    return;
  }

  const currentUser = await getUserById(authenticatedUser.userId);

  const {
    eventName,
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
  } = req.body;
  const startDate = new Date(startYear, startMonth - 1, startDay, startHour - 5, startMinute);
  const stopDate = new Date(stopYear, stopMonth - 1, stopDay, stopHour - 5, stopMinute);

  try {
    await addNewEvent(eventName, startDate, stopDate, currentUser.userId);
    console.log(currentUser.ownedEvents);
    res.redirect(`/users/${authenticatedUser.userId}}/calendar`);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

export { registerEvent, renderEvent };
