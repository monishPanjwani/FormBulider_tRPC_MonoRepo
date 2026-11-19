"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { readFormDocument } from "~/lib/form-builder/form-document";
import { trpc } from "~/trpc/client";
import { ArrowLeft, Inbox } from "lucide-react";

export default function ResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: form, isLoading: isFormLoading } = trpc.form.getById.useQuery({ id });
  const { data: submissions, isLoading: isSubmissionsLoading } = trpc.formSubmission.getByFormId.useQuery({ formId: id });

  if (isFormLoading || isSubmissionsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground font-medium">Loading responses...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <p className="text-destructive font-medium">Form not found or you don't have access.</p>
      </div>
    );
  }

  // Ensure elements are available to map IDs to Labels
  const elements = readFormDocument(form.elements).fields.filter(el => el.type !== "text" && el.type !== "image");

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans text-foreground">
      <button onClick={() => router.push('/dashboard')} className="flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Responses: {form.title}</h1>
        <p className="text-muted-foreground">{submissions?.length || 0} total submissions</p>
      </div>

      {!submissions || submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-border rounded-xl bg-muted">
          <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No responses yet</h3>
          <p className="text-muted-foreground text-sm max-w-md text-center mt-2">
            Share your form link to start collecting responses. Submissions will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card border border-border rounded-xl shadow-sm">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="text-xs text-foreground uppercase bg-muted border-b border-border">
              <tr>
                <th scope="col" className="px-6 py-4">Submitted At</th>
                <th scope="col" className="px-6 py-4">Respondent Email</th>
                {elements.map((el: any) => (
                  <th key={el.id} scope="col" className="px-6 py-4 truncate max-w-[200px]" title={el.props?.question || el.label}>
                    {el.props?.question || el.label || el.props?.placeholder || el.props?.label || el.type}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub: any) => (
                <tr key={sub.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">
                    {new Date(sub.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {sub.respondentEmail || <span className="text-muted-foreground italic">Anonymous</span>}
                  </td>
                  {elements.map((el: any) => {
                    const responseValue = sub.responses?.[el.id];
                    let displayValue = responseValue;
                    if (Array.isArray(responseValue)) {
                      displayValue = responseValue.join(", ");
                    }
                    return (
                      <td key={el.id} className="px-6 py-4 max-w-[300px] truncate" title={displayValue?.toString()}>
                        {displayValue !== undefined && displayValue !== null ? displayValue.toString() : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
