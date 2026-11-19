"use client";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Headphones,
  MessageSquare,
  Monitor,
  Plus,
  ScanLine,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useFormStore } from "../../lib/form-builder/store";
import { instantiateTemplate, templates } from "../../lib/form-builder/templates";
import { StudioHeader } from "../StudioHeader";

const icons = {
  "demo-request": Monitor,
  "lead-qualification": ScanLine,
  "support-ticket": Headphones,
  "customer-feedback": MessageSquare,
  "employee-onboarding": Users,
  "vendor-onboarding": Building2,
  "event-registration": CalendarDays,
  "job-application": BriefcaseBusiness,
};

export function ThemeSelector({ onSelect }: { onSelect: () => void }) {
  const { loadTemplate, setTheme, setFormStyle, companyName, setCompanyName } = useFormStore();
  function open(template?: (typeof templates)[number]) {
    loadTemplate(template ? instantiateTemplate(template) : []);
    if (template && (!companyName || companyName === "My New Form")) setCompanyName(template.name);
    setTheme("auto");
    setFormStyle({
      backgroundUrl: null,
      customAppBg: null,
      customCanvasBg: null,
      customTextColor: null,
    });
    onSelect();
  }
  return (
    <div className="min-h-screen">
      <StudioHeader section="templates">
        <Link href="/dashboard">Dashboard</Link>
      </StudioHeader>
      <main className="studio-container py-12">
        <div className="section-title">
          <div>
            <h1>
              Template library<span className="brand-dot">.</span>
            </h1>
            <p>Choose a starting point. Every field can be edited in the studio.</p>
          </div>
          <button onClick={() => open()} className="action">
            <Plus size={17} /> Blank form
          </button>
        </div>
        <div className="template-grid">
          {templates.map((template) => {
            const Icon = icons[template.id as keyof typeof icons];
            return (
              <button className="template-card" key={template.id} onClick={() => open(template)}>
                <div className="flex items-center justify-between">
                  <Icon aria-hidden="true" />
                  <span className="meta">{template.category}</span>
                </div>
                <h2>{template.name}</h2>
                <p>{template.description}</p>
                <div className="template-foot">
                  <span>{template.elements.filter((el) => el.type !== "text").length} fields</span>
                  <ArrowUpRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
