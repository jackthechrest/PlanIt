import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors

import express, { Express } from 'express';

import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { registerUser, logIn, getUserProfileData, logoRedirect, sendVerification, verifyEmail, deleteAccount, renderCalendar, renderSearch, renderMessages, renderNotifications, renderReports } from './controllers/UserController';
import { followUser, renderFollowersPage, renderFollowingPage, unfollowUser } from './controllers/FollowController';

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
app.post('/users/verify', verifyEmail);
app.post('/users/delete', deleteAccount);

app.get('/logo', logoRedirect);
app.get('/users/:targetUserId/calendar', renderCalendar);
app.get('/search', renderSearch);
app.get('/users/:targetUserId/messages', renderMessages);
app.get('/users/:targetUserId/other', renderNotifications);
app.get('/reports', renderReports);

// Following/Followers
app.get('/users/follow/:targetUserId', followUser);
app.get('/users/unfollow/:targetUserId', unfollowUser);
app.get('/users/:targetUserId/following', renderFollowingPage);
app.get('/users/:targetUserId/followers', renderFollowersPage);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
