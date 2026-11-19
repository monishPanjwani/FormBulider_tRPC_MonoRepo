"use client";

import React from "react";
import { trpc } from "~/trpc/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { data: forms, isLoading: formsLoading, isError: formsError } = trpc.form.getMyForms.useQuery();
  const { data: user, isLoading: userLoading, error: userError, refetch: retryUser } = trpc.auth.me.useQuery(undefined, {
    retry: false // Don't retry if user is not found
  });
  
  const createFormMutation = trpc.form.create.useMutation({
    onSuccess: (data) => {
      if (data?.id) {
        router.push(`/builder?id=${data.id}`);
      }
    },
  });

  const utils = trpc.useUtils();
  const deleteForm = trpc.form.delete.useMutation({
    onSuccess: async ({ id }) => {
      utils.form.getMyForms.setData(undefined, forms => forms?.filter(form => form.id !== id));
      await utils.form.invalidate();
      toast.success("Form deleted.");
    },
    onError: (error) => toast.error(error.message),
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Force a full page reload to clear any cached states
      window.location.href = "/";
    },
  });

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Form link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleCreateForm = () => {
    createFormMutation.mutate({
      title: "My New Form",
      description: "",
    });
  };

  if (userError) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-20 text-center font-sans">
        <h2 className="text-2xl font-bold mb-4">
          {userError.data?.code === "UNAUTHORIZED" ? "Sign in to continue" : "Couldn’t load your account"}
        </h2>
        {userError.data?.code === "UNAUTHORIZED" ? (
          <Link href="/login" className="action mx-auto">Log in</Link>
        ) : (
          <button type="button" className="action mx-auto" onClick={() => retryUser()}>Try again</button>
        )}
      </div>
    );
  }

  if (formsLoading || userLoading) return <div className="p-8 font-sans">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans text-foreground">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <div className="flex items-center text-muted-foreground space-x-2">
            <User className="w-4 h-4" />
            <span>{user?.firstName} {user?.lastName} ({user?.email})</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center text-muted-foreground hover:text-destructive font-medium transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
          </button>
          <button
            onClick={handleCreateForm}
            className="bg-primary hover:bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            disabled={createFormMutation.isPending}
          >
            {createFormMutation.isPending ? "Creating..." : "+ Create Form"}
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">My Forms</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms?.map((form) => (
          <div key={form.id} className="border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow bg-card flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="break-words min-w-0 text-xl font-semibold">{form.title}</h2>
              <button
                type="button" aria-label={`Delete ${form.title}`}
                className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                disabled={deleteForm.isPending}
                onClick={() => {
                  if (window.confirm(`Delete “${form.title}” and all its responses? This is permanent.`)) {
                    deleteForm.mutate({ id: form.id });
                  }
                }}
              ><Trash2 size={15} /> Delete</button>
            </div>
            <div className="flex flex-col gap-2 mb-4 flex-1">
              <p className="text-muted-foreground text-sm">{form.description}</p>
              {form.visibility === 'private' && Array.isArray(form.allowedEmails) && form.allowedEmails.length > 0 && (
                <details className="text-xs text-muted-foreground mt-2 group outline-none">
                  <summary className="font-medium cursor-pointer hover:text-primary transition-colors list-none flex items-center gap-1 select-none">
                    View Allowed Emails ({form.allowedEmails.length})
                    <span className="group-open:rotate-180 transition-transform text-[8px] ml-1">▼</span>
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-1.5 p-2 bg-muted rounded-lg border border-border max-h-24 overflow-y-auto">
                    {(form.allowedEmails as string[]).map(email => (
                      <span key={email} className="bg-card border border-border text-muted-foreground px-1.5 py-0.5 rounded shadow-sm">{email}</span>
                    ))}
                  </div>
                </details>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 items-center justify-between mt-auto pt-4 border-t border-border">
              {form.visibility === 'private' ? (
                <span className="bg-accent text-primary text-xs font-medium px-2 py-1 rounded-md">Private</span>
              ) : form.status === 'draft' || form.visibility === 'unlisted' ? (
                <span className="bg-muted text-foreground text-xs font-medium px-2 py-1 rounded-md">Draft</span>
              ) : (
                <span className="bg-accent text-primary text-xs font-medium px-2 py-1 rounded-md">Public</span>
              )}
              
              <div className="flex gap-3 items-center">
                <button 
                  onClick={() => handleCopyLink(form.slug)} 
                  title="Copy link to form"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {form.status === 'published' && form.visibility !== 'unlisted' && (
                  <Link href={`/f/${form.slug}`} target="_blank" className="text-sm font-medium text-primary hover:text-primary">
                    View
                  </Link>
                )}
                <Link href={`/dashboard/responses/${form.id}`} className="text-sm font-medium text-primary hover:underline">
                  Responses
                </Link>
                <Link href={`/builder?id=${form.id}`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
        {formsError && <p role="alert" className="text-destructive">Couldn’t load your forms.</p>}
        {!formsError && (!forms || forms.length === 0) && (
          <div className="col-span-full text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <p className="mb-4">No forms found.</p>
            <button
              onClick={handleCreateForm}
              className="text-primary font-medium hover:underline"
            >
              Create your first form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
