import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors

import express, { Express } from 'express';

import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { registerUser, logIn, getUserProfileData, logoRedirect, deleteAccount, renderCalendar, renderSearch, renderMessages, renderSettings, renderDelete } from './controllers/UserController';
import { followUser, renderFollowersPage, renderFollowingPage, unfollowUser } from './controllers/FollowController';
import { sendVerification, verifyEmail } from './controllers/VerifyCodeController';
import { friendRequestUser, renderFriendsPage, respondFriendRequest, unfriendUser } from './controllers/FriendListController';
import { renderNotifications } from './controllers/NotifcationsController';
import { renderReports } from './controllers/ReportController';

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

app.post('/api/users', registerUser); // Create an account
app.post('/api/login', logIn); // Log in to an account
app.get('/users/:targetUserId', getUserProfileData);
app.get('/verify', sendVerification);
app.post('/api/verify', verifyEmail);
app.post('/api/delete', deleteAccount);

app.get('/logo', logoRedirect);
app.get('/settings', renderSettings);
app.get('/delete', renderDelete);
app.get('/users/:targetUserId/calendar', renderCalendar);
app.get('/search', renderSearch);
app.get('/users/:targetUserId/messages', renderMessages);
app.get('/users/:targetUserId/other', renderNotifications);
app.get('/reports', renderReports);

// Following/Followers/Friends
app.get('/users/follow/:targetUserId', followUser);
app.get('/users/unfollow/:targetUserId', unfollowUser);
app.get('/users/friend/:targetUserId', friendRequestUser);
app.get('/api/friend/:targetUserId/:action', respondFriendRequest);
app.get('/api/unfriend/:targetUserId', unfriendUser);
app.get('/users/:targetUserId/following', renderFollowingPage);
app.get('/users/:targetUserId/followers', renderFollowersPage);
app.get('/users/:targetUserId/friends', renderFriendsPage);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
