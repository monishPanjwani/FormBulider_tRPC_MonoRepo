import { publicProcedure, protectedProcedure, router } from "../../trpc";

import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  loginWithEmailAndPasswordInputModel,
  loginWithEmailAndPasswordOutputModel,
} from "./model";

import { generatePath } from "../../utils/path-generator";
import { startSession, endSession, refreshSession } from "../../session";

import { userService } from "../../services";

const getPath = generatePath("/authentication");
const TAGS = ["Authentication"];

export const authRouter = router({
  createUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createUserWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { firstName, lastName, email, password } = input;

      const user = await userService.createUserWithEmailAndPassword({
        firstName,
        lastName,
        email,
        password,
      });

      await startSession(ctx, user.id);
      return { id: user.id };
    }),
  loginWithEmailAndPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/loginWithEmailAndPassword"),
        tags: TAGS,
      },
    })
    .input(loginWithEmailAndPasswordInputModel)
    .output(loginWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      const user = await userService.loginWithEmailAndPassword({
        email,
        password,
      });

      await startSession(ctx, user.id);
      return { id: user.id };
    }),
  refreshSession: publicProcedure.mutation(async ({ ctx }) => {
    await refreshSession(ctx);
    return { success: true };
  }),
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await userService.getUserById(ctx.user!.id);
      if (!user) throw new Error("USER_NOT_FOUND");
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };
    }),
  logout: publicProcedure
    .mutation(async ({ ctx }) => {
      await endSession(ctx);
      return { success: true };
    }),
});
