 
import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors

import express, { Express } from 'express';

import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { banUser, cancelEvent, editEvent, inviteToEvent, joinEvent, leaveEvent, registerEvent, renderBannedPage, renderCreateEvent, renderEditEventPage, renderEvent, renderInvitePage, renderInvitedPage, renderJoinedPage, unbanUser, uninviteFromEvent } from './controllers/EventController';
import { registerUser, logIn, getUserProfileData, logoRedirect, deleteAccount, renderCalendar, renderSettings, signOut, renderEditPage, editProfile, renderDay } from './controllers/UserController';
import { followUser, removeFollower, renderFollowersPage, renderFollowingPage, unfollowUser } from './controllers/FollowController';
import { sendVerification, verifyEmail } from './controllers/VerifyCodeController';
import { blockUser, friendRequestUser, renderBlockedPage, renderFriendsPage, respondFriendRequest, unblockUser, unfriendUser } from './controllers/FriendListController';
import { renderNotifications } from './controllers/NotifcationsController';
import { renderReports, respondReport, sendReport } from './controllers/ReportController';
import { renderAllMessageThreads, renderSingleMessageThread } from './controllers/MessageThreadController';
import { renderCreateMessageThread, sendMessage } from './controllers/MessageController';
import { postNewComment, renderComment } from './controllers/CommentController';
import { search, searchResults } from './controllers/SearchController';

const app: Express = express();
const { PORT, COOKIE_SECRET } = process.env;

const SQLiteStore = connectSqlite3(session);
app.set('view engine', 'ejs');
app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite' }),
    secret: COOKIE_SECRET,
    cookie: { maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
    name: 'session',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static('public', { extensions: ['html'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Users
app.post('/api/users', registerUser); // Create an account
app.post('/api/login', logIn); // Log in to an account
app.get('/signout', signOut)
app.get('/users/:targetUserId', getUserProfileData);
app.get('/verify', sendVerification);
app.post('/api/verify', verifyEmail);
app.post('/api/delete', deleteAccount);

app.get('/logo', logoRedirect);
app.get('/settings', renderSettings);
app.get('/edit', renderEditPage);
app.post('/api/edit', editProfile);
app.get('/users/:targetUserId/calendar', renderCalendar);
app.get('/notifications', renderNotifications);
app.get('/reports', renderReports);

// Following/Followers/Friends/Blocked
app.get('/users/follow/:targetUserId', followUser);
app.get('/users/unfollow/:targetUserId', unfollowUser);
app.get('/users/remove/:targetUserId', removeFollower);
app.get('/users/block/:targetUserId', blockUser);
app.get('/users/unblock/:targetUserId', unblockUser);
app.get('/users/friend/:targetUserId', friendRequestUser);
app.get('/api/friend/:targetUserId/:action', respondFriendRequest);
app.get('/api/unfriend/:targetUserId', unfriendUser);
app.get('/users/:targetUserId/following', renderFollowingPage);
app.get('/users/:targetUserId/followers', renderFollowersPage);
app.get('/users/:targetUserId/friends', renderFriendsPage);
app.get('/users/:targetUserId/blocked', renderBlockedPage);

// Messages
app.get('/messages', renderAllMessageThreads);
app.get('/messages/:messageThreadId', renderSingleMessageThread);
app.get('/send', renderCreateMessageThread); 
app.post('/api/send', sendMessage); // Post request to send a message

// Reports
app.get('/report/:reportType/:contentId', sendReport)
app.get('/report/respond/:contentId/:action', respondReport)

// Events
app.post('/api/event', registerEvent);
app.get('/users/:targetUserId/createEvent', renderCreateEvent);
app.get('/events/:eventID', renderEvent);
app.get('/users/:targetUserId/:targetYear/:targetMonth/:targetDay', renderDay);
app.post('/api/editEvent', editEvent);
app.get('/events/:eventID/edit', renderEditEventPage);
app.get('/events/:eventID/join', joinEvent);
app.get('/events/:eventID/leave', leaveEvent);
app.get('/events/:eventID/joined', renderJoinedPage);
app.get('/events/:eventID/invite', renderInvitePage);
app.post('/api/invite', inviteToEvent);
app.get('/events/:eventID/uninvite/:targetUserId', uninviteFromEvent);
app.get('/events/:eventID/invited', renderInvitedPage);
app.get('/events/:eventID/cancel', cancelEvent);
app.get('/events/:eventID/ban/:targetUserId', banUser);
app.get('/events/:eventID/unban/:targetUserId', unbanUser);
app.get('/events/:eventID/banned', renderBannedPage);
app.post('/api/comment', postNewComment);
app.get('/events/:eventID/comments/:commentId', renderComment);

// Search
app.post('/api/search', search);
app.get('/results/:searchOption/:linkSearchQuery', searchResults);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});