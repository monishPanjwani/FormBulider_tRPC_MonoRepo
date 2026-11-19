"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { StudioHeader } from "../StudioHeader";
import { formSurfaceStyle } from "../../lib/form-builder/surface-style";
import { useFormStore } from "../../lib/form-builder/store";
import type { FormElement, Theme } from "../../lib/form-builder/types";

type Answer = string | number | boolean | string[];
type Answers = Record<string, Answer>;

function ResponseField({
  el,
  value,
  onChange,
}: {
  el: FormElement;
  value?: Answer;
  onChange: (value: Answer) => void;
}) {
  const { id, type, props } = el;
  if (type === "text")
    return (
      <h2 className="border-b border-current/20 pb-3 text-2xl font-semibold tracking-tight">
        {props.text}
      </h2>
    );
  if (type === "image")
    return (
      props.url && (
        <img
          src={props.url}
          alt={props.question || "Form illustration"}
          className="mx-auto max-h-64 rounded-md object-contain"
        />
      )
    );

  const options: string[] = props.options ?? ["Option 1", "Option 2"];
  const title = props.question || props.placeholder || props.label || "Your answer";
  const marker = props.required && <span aria-hidden="true"> *</span>;
  const caption = (
    <label htmlFor={id} className="mb-2 block font-medium">
      {title}
      {marker}
    </label>
  );
  const common = {
    id,
    required: !!props.required,
    className: "form-control",
    value: String(value ?? ""),
  };
  const placeholder = props.placeholder !== title ? props.placeholder : undefined;

  switch (type) {
    case "short-input":
    case "url":
    case "email":
    case "number":
    case "date":
      return (
        <div>
          {caption}
          <input
            {...common}
            type={type === "short-input" ? "text" : type}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      );
    case "long-input":
      return (
        <div>
          {caption}
          <textarea
            {...common}
            rows={4}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      );
    case "dropdown":
      return (
        <div>
          {caption}
          <select {...common} onChange={(event) => onChange(event.target.value)}>
            <option value="">{props.label || "Select an option"}</option>
            {options.map((opt, i) => (
              <option key={i} value={props.options ? opt : `opt${i + 1}`}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    case "checkbox":
      return (
        <div>
          {props.question && <p className="mb-2 font-medium">{props.question}</p>}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!value}
              required={!!props.required}
              onChange={(event) => onChange(event.target.checked)}
            />{" "}
            {props.label || props.question || "Yes"}
            {marker}
          </label>
        </div>
      );
    case "rating":
    case "poll":
    case "single-select":
    case "multi-select": {
      const multiple = type === "multi-select";
      const selected = Array.isArray(value) ? value : [];
      const items = type === "rating" ? ["1", "2", "3", "4", "5"] : options;
      return (
        <fieldset>
          <legend className="mb-3 font-medium">
            {title}
            {marker}
          </legend>
          <div className="flex flex-wrap gap-2">
            {items.map((opt, i) => (
              <label
                key={i}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-card-foreground has-checked:border-primary has-checked:bg-accent has-checked:text-accent-foreground"
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={id}
                  value={opt}
                  checked={multiple ? selected.includes(opt) : String(value ?? "") === opt}
                  required={!!props.required && (!multiple || (!selected.length && i === 0))}
                  onChange={(event) => {
                    if (multiple)
                      onChange(
                        event.target.checked
                          ? [...selected, opt]
                          : selected.filter((item) => item !== opt),
                      );
                    else onChange(type === "rating" ? Number(opt) : opt);
                  }}
                />
                {type === "rating" ? `${opt} ★` : opt}
              </label>
            ))}
          </div>
        </fieldset>
      );
    }
  }
}

interface FormAppearance {
  companyName?: string | null;
  theme?: Theme;
  backgroundUrl?: string | null;
  customAppBg?: string | null;
  customCanvasBg?: string | null;
  customTextColor?: string | null;
}

export function FormViewer({
  onBack,
  onSubmit,
  isSubmitting,
  initialElements,
  initialThemeProps,
}: {
  onBack?: () => void;
  onSubmit?: (responses: Answers) => void;
  isSubmitting?: boolean;
  initialElements?: FormElement[];
  initialThemeProps?: FormAppearance;
}) {
  const store = useFormStore();
  const appearance = initialElements === undefined ? store : (initialThemeProps ?? {});
  const elements = initialElements ?? store.elements;
  const [responses, setResponses] = useState<Answers>({});
  function submit(event: FormEvent) {
    event.preventDefault();
    if (onSubmit) onSubmit(responses);
    else toast.info("Preview only. Responses are collected on the published form.");
  }
  return (
    <div
      className="studio-grid min-h-screen"
      style={{ backgroundColor: appearance.customAppBg ?? undefined }}
    >
      <StudioHeader section={onBack ? "preview" : "forms"}>
        {onBack && (
          <button type="button" className="inline-flex items-center gap-2" onClick={onBack}>
            <ArrowLeft size={16} /> Back to editor
          </button>
        )}
      </StudioHeader>
      <main className="relative isolate px-4 py-10 md:py-16">
        {appearance.backgroundUrl && (
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${appearance.backgroundUrl})` }}
          />
        )}
        <form
          onSubmit={submit}
          data-mode={appearance.theme ?? "auto"}
          className="form-surface mx-auto grid max-w-2xl gap-7 p-6 md:p-10"
          style={formSurfaceStyle(appearance.customCanvasBg, appearance.customTextColor)}
        >
          {appearance.companyName && (
            <h1 className="break-words font-mono text-xl font-medium">{appearance.companyName}</h1>
          )}
          {elements.map((el) => (
            <ResponseField
              key={el.id}
              el={el}
              value={responses[el.id]}
              onChange={(value) => setResponses((prev) => ({ ...prev, [el.id]: value }))}
            />
          ))}
          <div className="border-t border-current/20 pt-5">
            <button className="action disabled:opacity-60" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit response"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
