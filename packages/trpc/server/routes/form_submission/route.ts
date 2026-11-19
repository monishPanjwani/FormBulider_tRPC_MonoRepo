import { publicProcedure, router, protectedProcedure } from "../../trpc";
import { createFormSubmissionInputModel, getSubmissionsInputModel } from "./model";
import { requireRespondentAccess } from "../../form-access";
import { formService, formSubmissionService } from "../../services";

export const formSubmissionRouter = router({
  create: publicProcedure
    .input(createFormSubmissionInputModel)
    .mutation(async ({ input, ctx }) => {
      await requireRespondentAccess(ctx, await formService.getFormById(input.formId));
      return await formSubmissionService.submitForm({
        ...input,
        ipAddress: undefined, // Or extracted from context if added
        userAgent: undefined, // Or extracted from context if added
      });
    }),
    
  getByFormId: protectedProcedure
    .input(getSubmissionsInputModel)
    .query(async ({ input, ctx }) => {
      return await formSubmissionService.getSubmissionsByFormId(input.formId, ctx.user!.id);
    })
});
