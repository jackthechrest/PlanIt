import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

async function getUserById(userId: string): Promise<User | null> {
  const user = await userRepository.findOne({ where: { userId }, 
    relations: [
    'following',
    'followers',
    'code',
    ],
  });
  return user;
}

async function getUserByUsername(username: string): Promise<User | null> {
  console.log({ username });

  const user = await userRepository
    .createQueryBuilder('user')
    .where('username = :username', { username })
    .getOne();
  return user;
}

async function getUserByEmail(email: string): Promise<User | null> {
  console.log({ email });

  const user = await userRepository
    .createQueryBuilder('user')
    .where('email = :email', { email })
    .getOne();
  return user;
}

async function addNewUser(username: string, displayName: string, email: string, passwordHash: string): Promise<User | null> {
  // Create the new user object
  let newUser = new User();
  newUser.username = username;
  newUser.displayName = displayName;
  newUser.email = email;
  newUser.passwordHash = passwordHash;

  newUser = await userRepository.save(newUser);

  return newUser;
}

async function deleteUserById(userId: string): Promise<void> {
  await userRepository
    .createQueryBuilder('user')
    .delete()
    .where('userId = :userId', { userId })
    .execute();
}

async function setVerifiedByUserId(userId: string): Promise<User | null> {
  const updatedUser = await getUserById(userId);
  updatedUser.verifiedEmail = true;

  await userRepository
    .createQueryBuilder()
    .update(User)
    .set({ verifiedEmail: true })
    .where({ userId: userId })
    .execute();

  return updatedUser;
}


export { getUserById, getUserByUsername, getUserByEmail, addNewUser, deleteUserById, setVerifiedByUserId };
