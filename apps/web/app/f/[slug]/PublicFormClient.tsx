"use client";

import React from "react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { readFormDocument } from "~/lib/form-builder/form-document";
import { FormViewer } from "~/components/form-builder/FormViewer";

export default function PublicFormClient({ form }: { form: { id: string; title: string; elements: unknown } }) {
  const submitMutation = trpc.formSubmission.create.useMutation();
  const { fields, appearance } = readFormDocument(form.elements);

  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (responses: Record<string, any>) => {
    submitMutation.mutate(
      {
        formId: form.id,
        responses,
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: (err) => toast.error("Failed to submit: " + err.message)
      }
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans text-foreground">
        <div className="bg-card p-12 rounded-lg shadow-sm text-center max-w-md w-full border border-border">
          <div className="w-16 h-16 bg-accent text-primary rounded-md flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground">Your response has been successfully submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <FormViewer 
      initialElements={fields}
      initialThemeProps={{ companyName: form.title, ...appearance }}
      onSubmit={handleSubmit}
      isSubmitting={submitMutation.isPending}
    />
  );
}
