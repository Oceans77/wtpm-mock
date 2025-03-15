// src/models/user.model.ts
import { v4 as uuidv4 } from 'uuid';

// This is a mock model since we haven't set up the database yet
// In a real application, this would use Knex to interact with the database

export interface IUser {
  id: string;
  email: string;
  password: string;
  username: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  verificationStatus: string;
  accountType: string;
  role: string; // Added role field
}

// Mock database
const users: IUser[] = [];

export class User {
  public id: string;
  public email: string;
  public password: string;
  public username: string;
  public displayName: string;
  public createdAt: Date;
  public updatedAt: Date;
  public lastLoginAt?: Date;
  public isActive: boolean;
  public verificationStatus: string;
  public accountType: string;
  public role: string; // Added role property

  constructor(data: Partial<IUser>) {
    this.id = data.id || uuidv4();
    this.email = data.email || '';
    this.password = data.password || '';
    this.username = data.username || '';
    this.displayName = data.displayName || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastLoginAt = data.lastLoginAt;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.verificationStatus = data.verificationStatus || 'unverified';
    this.accountType = data.accountType || 'standard_user';
    this.role = data.role || 'user'; // Default role is 'user'
  }

  static async findOne(query: Partial<IUser>): Promise<User | null> {
    const user = users.find((u) => {
      return Object.keys(query).every((key) => {
        return u[key as keyof IUser] === query[key as keyof IUser];
      });
    });

    return user ? new User(user) : null;
  }

  static async findById(id: string): Promise<User | null> {
    return await User.findOne({ id });
  }

  async save(): Promise<User> {
    const existingIndex = users.findIndex((u) => u.id === this.id);
    
    if (existingIndex >= 0) {
      // Update existing user
      this.updatedAt = new Date();
      users[existingIndex] = { ...this };
    } else {
      // Add new user
      users.push({ ...this });
    }
    
    return this;
  }

  // New method to create an admin user
  static async createAdminUser(userData: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }): Promise<User> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new admin user
    const adminUser = new User({
      ...userData,
      role: 'admin',
      verificationStatus: 'verified', // Auto-verify admin users
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save to database
    await adminUser.save();
    return adminUser;
  }
}
