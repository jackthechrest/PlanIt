import { Request, Response } from 'express';
import { hasUnreadNotifications } from '../models/NotificationsModel';
import { getUserById } from '../models/UserModel';
import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';
import { Event } from '../entities/Event';
import { Like } from 'typeorm';

const userRepository = AppDataSource.getRepository(User);
const eventRepository = AppDataSource.getRepository(Event);

async function renderSearch(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
  
    let results;

    if (!isLoggedIn) {
      res.redirect('/login'); // not logged in
      return;
    }
    const user = await getUserById(authenticatedUser.userId);
    const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

    const hasSearched = false;
  
    res.render('search', { user, hasUnread, hasSearched, searchOption1: "searchOption", results});
  }



async function search(req: Request, res: Response): Promise<void> {
    const {searchQuery, searchOption} = req.body;
    // converts spaces in the search query to underscore so that the link can work
    const linkSearchQuery = searchQuery.replace(/ /g, '_');


   res.redirect(`/results/${searchOption}/${linkSearchQuery}`)
}

async function searchResults(req: Request, res: Response): Promise<void> {
  console.log("beginning search results function ")
  const {linkSearchQuery, searchOption} = req.params;
  const { isLoggedIn, authenticatedUser } = req.session;
  const user = await getUserById(authenticatedUser.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);
  const hasSearched = true;
  let UserResults: User [];
  let EventResults: Event[];

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  // converts the underscores back to spaces
  const searchQuery = linkSearchQuery.replace(/_/g, ' ');
  console.log(searchQuery, searchOption)

  if (searchOption === "Users"){
    console.log("beginning  user search...");
      UserResults = await userRepository.find(
        {
          select: {userId: true, username: true, displayName:true},
          where:[
            {username: Like(`%${searchQuery}%`)}, 
            {displayName: Like(`%${searchQuery}%`)},
          ],
          
        }
      );

      console.log("Results:", UserResults);
      (await UserResults).forEach(user => {
        console.log("User: ", user.username);
      })
  }

  else if (searchOption === "Events"){
    console.log("beginning  event search...");
      EventResults = await eventRepository.find(
        {
          select: {eventID: true, eventName: true, startDate:true, stopDate:true, location:true,},
          relations: {owner: true},
          where:[
            {eventName: Like(`%${searchQuery}%`)}, 
          ],
          
        }
      );

      console.log("Results:", EventResults);
      (await EventResults).forEach(event => {
        console.log("Event: ", event.eventName);
      })
  }

    

  res.render('searchResults', { user, hasUnread, hasSearched, searchOption, UserResults, EventResults});
}

export {renderSearch, search, searchResults}