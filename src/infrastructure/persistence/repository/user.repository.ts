import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { users } from '../schema';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';

export class MysqlUserRepository implements UserRepository {
  /**
   * Finds a user by their primary key (ID).
   * @param id The internal numeric ID of the user.
   * @returns A User entity or null if not found.
   */
  async findById(id: number): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return user ? new User(user) : null;
  }

  /**
   * Finds a user by their email address.
   * @param email The user's email address.
   * @returns A User entity or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    // Correctly query for a single user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user ? new User(user) : null;
  }

  /**
   * Creates a new user in the database.
   * @param data An object containing the user's email.
   * @returns The newly created User entity.
   */
  async create(data: { email: string }): Promise<User> {
    // Insert the new user with a generated public-facing userId
    const insertResult = await db.insert(users).values({
      email: data.email,
      userId: uuidv4(), // Generates a unique v4 UUID
      hashedPassword: '', // Set a default or handle this based on your needs
    });

    const newUserId = insertResult[0].insertId;

    // Fetch and return the newly created user
    const newUser = await this.findById(newUserId);

    if (!newUser) {
      throw new Error('Failed to create and retrieve user.');
    }

    return newUser;
  }
}
