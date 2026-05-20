// eslint-disable-next @typescript-eslint/no-unused-vars
import User, { IUser, UserRole } from "../models/user.model";

const UserModel = User as unknown as {
  create(data: any): Promise<any>;
  findOne(filter: Record<string, unknown>): any;
  findById(id: string): any;
  insertMany(docs: any[]): Promise<any[]>;
};

export async function createUser(data: Omit<IUser, "_id" | "createdAt">): Promise<IUser> {
  return (await UserModel.create(data)) as unknown as IUser;
}

export async function findByEmail(email: string): Promise<IUser | null> {
  return (await UserModel.findOne({ email }).lean()) as unknown as (IUser | null);
}

export async function findById(id: string): Promise<IUser | null> {
  return (await UserModel.findById(id).lean()) as unknown as (IUser | null);
}

export async function createDemoUsers(): Promise<IUser[]> {
  const passwordHash = "$2b$12$LQv3c1yqBWVHxkm07D7V9evvWYRSyDDMdLlLqsqT0K3gk/5qfDDiO";

  const users = await UserModel.insertMany([
    { email: "admin@ticketflow.com", passwordHash, name: "Admin", role: UserRole.ADMIN },
    { email: "organizer1@ticketflow.com", passwordHash, name: "Organizer One", role: UserRole.ORGANIZER },
    { email: "organizer2@ticketflow.com", passwordHash, name: "Organizer Two", role: UserRole.ORGANIZER },
    { email: "buyer1@ticketflow.com", passwordHash, name: "Buyer One", role: UserRole.BUYER },
    { email: "buyer2@ticketflow.com", passwordHash, name: "Buyer Two", role: UserRole.BUYER },
    { email: "buyer3@ticketflow.com", passwordHash, name: "Buyer Three", role: UserRole.BUYER },
    { email: "operator@ticketflow.com", passwordHash, name: "Operator One", role: UserRole.OPERATOR },
  ]);

  return users as unknown as IUser[];
}
