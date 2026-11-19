import {
  createUserWithEmailAndPassword,
  createUserWithEmailAndPasswordType,
  loginWithEmailAndPassword,
  loginWithEmailAndPasswordType,
} from "./model";
import { usersTable, InsertUser } from "@repo/database/models/user";
import { db, eq } from "@repo/database";
import bcrypt from "bcryptjs";
import { env } from "../env";

export default class userService {
  private async getUserByMail(email: string) {
    const res = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (!res || res.length === 0) return null;
    return res[0];
  }

  public async getUserById(id: string) {
    const res = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!res || res.length === 0) return null;
    return res[0];
  }

  private async createAnewUser(payload: InsertUser) {
    const res = await db
      .insert(usersTable)
      .values({
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        hashedPassword: payload.hashedPassword,
        salt: env.SALT,
      })
      .returning({ id: usersTable.id });

    if (!res || res.length === 0 || !res[0]?.id) {
      throw new Error("Something Went Wrong");
    }
    return res[0];
  }

  public async createUserWithEmailAndPassword(payload: createUserWithEmailAndPasswordType) {
    const { email, firstName, lastName, password } =
      await createUserWithEmailAndPassword.parseAsync(payload);
    const userExists = await this.getUserByMail(payload.email);
    if (userExists) {
      throw new Error(" User already exist");
    }
    let hashedPassword = await bcrypt.hash(password, Number(env.SALT));
    const res = await this.createAnewUser({ email, firstName, lastName, hashedPassword });
    return res;
  }

  public async loginWithEmailAndPassword(payload: loginWithEmailAndPasswordType) {
    const { email, password } = await loginWithEmailAndPassword.parseAsync(payload);
    const userExists = await this.getUserByMail(email);
    if (!userExists || !userExists.hashedPassword) {
      throw new Error("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, userExists.hashedPassword);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }
    return { id: userExists.id };
  }
}
