import { requireRespondentAccess } from "../../form-access";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router, protectedProcedure } from "../../trpc";
import { createFormInputModel, updateFormInputModel, getBySlugInputModel, getByIdInputModel } from "./model";
import { formService } from "../../services";

export const formRouter = router({
  create: protectedProcedure
    .input(createFormInputModel)
    .mutation(async ({ input, ctx }) => {
      // ctx.user is guaranteed by protectedProcedure
      return await formService.createForm(ctx.user!.id, input);
    }),
    
  delete: protectedProcedure
    .input(getByIdInputModel)
    .mutation(async ({ input, ctx }) => {
      const deleted = await formService.deleteForm(input.id, ctx.user!.id);
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return { id: deleted.id };
    }),

  update: protectedProcedure
    .input(updateFormInputModel)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      return await formService.updateForm(id, ctx.user!.id, data);
    }),
    
  getMyForms: protectedProcedure
    .query(async ({ ctx }) => {
      return await formService.getFormsByUser(ctx.user!.id);
    }),

  getPublicForms: publicProcedure
    .query(async () => {
      return await formService.getPublicForms();
    }),
    
  getBySlug: publicProcedure
    .input(getBySlugInputModel)
    .query(async ({ input, ctx }) => {
      const form = await formService.getFormBySlug(input.slug);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      await requireRespondentAccess(ctx, form);
      const { id, title, description, slug, elements } = form;
      return { id, title, description, slug, elements };
    }),
    
  getById: protectedProcedure
    .input(getByIdInputModel)
    .query(async ({ input, ctx }) => {
      const form = await formService.getFormById(input.id);
      if (!form || form.userId !== ctx.user!.id) {
        throw new Error("Form not found or unauthorized");
      }
      return form;
    })
});
