"use client";

import React from "react";
import { trpc } from "~/trpc/client";
import Link from "next/link";
import { StudioHeader } from "~/components/StudioHeader";

export default function LiveFormsPage() {
  const { data: forms, isLoading, error } = trpc.form.getPublicForms.useQuery();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors">
      <StudioHeader section="directory"><Link href="/">Home</Link></StudioHeader>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="section-title"><div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Live Forms Directory</h1>
          <p className="text-lg text-muted-foreground">
            Browse and fill out publicly available forms created by the Formcraft community.
          </p>
        </div></div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading live forms...</div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">Failed to load live forms.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms?.map((form) => (
              <Link 
                href={`/f/${form.slug}`} 
                key={form.id}
                className="group block rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{form.title}</h2>
                  <span className="bg-accent text-primary text-xs font-semibold px-2.5 py-1 rounded-md">
                    Public
                  </span>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {form.description || "No description provided."}
                </p>
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {new Date(form.createdAt || Date.now()).toLocaleDateString()}</span>
                  <span className="font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Fill out form →
                  </span>
                </div>
              </Link>
            ))}
            
            {(!forms || forms.length === 0) && (
              <div className="col-span-full text-center py-24 border-2 border-dashed border-border rounded-lg text-muted-foreground">
                <p className="text-lg font-medium mb-2">No public forms yet</p>
                <p>Be the first to create and publish a public form!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
