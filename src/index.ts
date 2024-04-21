import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors

import express, { Express } from 'express';

import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { registerUser, logIn, getUserProfileData, logoRedirect, deleteAccount, renderCalendar, renderSearch, renderSettings, renderDelete, signOut, renderEditPage, editProfile } from './controllers/UserController';
import { followUser, renderFollowersPage, renderFollowingPage, unfollowUser } from './controllers/FollowController';
import { sendVerification, verifyEmail } from './controllers/VerifyCodeController';
import { blockUser, friendRequestUser, renderBlockedPage, renderFriendsPage, respondFriendRequest, unblockUser, unfriendUser } from './controllers/FriendListController';
import { renderNotifications } from './controllers/NotifcationsController';
import { renderReports } from './controllers/ReportController';
import { renderAllMessageThreads, renderSingleMessageThread } from './controllers/MessageThreadController';
import { renderCreateMessageThread, sendMessage } from './controllers/MessageController';

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

// Image Uploads
/* 
const cloudinary = require('cloudinary')
cloudinary.config({
cloud_name: 'your_cloud_name',
api_key: 'your_api_key',
api_secret: "your_api_secret"
});
module.exports = cloudinary;
*/

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
app.get('/delete', renderDelete);
app.get('/edit', renderEditPage);
app.post('/api/edit', editProfile);
app.get('/calendar', renderCalendar);
app.get('/search', renderSearch);
app.get('/notifications', renderNotifications);
app.get('/reports', renderReports);

// Following/Followers/Friends/Blocked
app.get('/users/follow/:targetUserId', followUser);
app.get('/users/unfollow/:targetUserId', unfollowUser);
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

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
