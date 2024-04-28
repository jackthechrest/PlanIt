import { Request, Response } from 'express';
import { hasUnreadNotifications } from '../models/NotificationsModel';
import { getUserById } from '../models/UserModel';
import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';
import { Event } from '../entities/Event';

const userRepository = AppDataSource.getRepository(User);
const eventRepository = AppDataSource.getRepository(Event);

async function renderSearch(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
  
    if (!isLoggedIn) {
      res.redirect('/login'); // not logged in
      return;
    }
  
    const user = await getUserById(authenticatedUser.userId);
    const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);
  
    res.render('search', { user, hasUnread, });
  }



async function searchUsers(req: Request, res: Response){
    const builder = userRepository.createQueryBuilder('users');

    if (req.query.s){
      builder.where("users.username LIKE :s", {s: '%${req.query.s}%'})
    }

    res.send(await builder.getMany());
}

async function searchEvents(req: Request, res: Response){
  const builder = eventRepository.createQueryBuilder('events');

  if (req.query.s){
    builder.where("events.eventName LIKE :s", {s: '%${req.query.s}%'})
  }

  res.send(await builder.getMany());
}

export {renderSearch, searchUsers, searchEvents}