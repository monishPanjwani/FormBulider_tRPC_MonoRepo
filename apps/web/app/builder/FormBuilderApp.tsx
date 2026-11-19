"use client";

import React, { useState, useEffect } from 'react';
import { trpc } from '~/trpc/client';
import { readFormDocument } from "../../lib/form-builder/form-document";
import { useFormStore } from '../../lib/form-builder/store';
import { ThemeSelector } from '../../components/form-builder/ThemeSelector';
import { FormViewer } from '../../components/form-builder/FormViewer';
import { FormBuilder } from '../../components/form-builder/FormBuilder';

export const FormBuilderApp: React.FC<{ formId?: string }> = ({ formId }) => {
  const [view, setView] = useState<'selector' | 'builder' | 'viewer'>('selector');
  const [initialized, setInitialized] = useState(false);

  const { data: form, isLoading } = trpc.form.getById.useQuery(
    { id: formId! }, 
    { enabled: !!formId }
  );

  const store = useFormStore();

  useEffect(() => {
    if (form && !initialized) {
      const { fields, appearance } = readFormDocument(form.elements);
      const { theme, ...colors } = appearance;
      store.setTheme(theme);
      store.setFormStyle(colors);
      store.loadTemplate(fields);
      if (fields.length > 0) {
        setView('builder'); // Skip selector for existing forms with elements
      } else {
        setView('selector');
      }
      if (form.title) store.setCompanyName(form.title);
      if (form.visibility) store.setVisibility(form.visibility as any);
      if (form.allowedEmails) store.setAllowedEmails(form.allowedEmails as string[]);
      setInitialized(true);
    } else if (!formId && !initialized) {
      setInitialized(true);
    }
  }, [form, initialized, store, formId]);

  if (formId && isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background font-sans">Loading editor...</div>;
  }

  // To prevent flashing the selector before the form loads:
  if (formId && !initialized) {
    return <div className="min-h-screen bg-background"></div>;
  }

  if (view === 'selector') return <ThemeSelector onSelect={() => setView('builder')} />;
  if (view === 'viewer') return <FormViewer onBack={() => setView('builder')} />;
  return <FormBuilder onBack={() => setView('selector')} onPreview={() => setView('viewer')} formId={formId} />;
};
