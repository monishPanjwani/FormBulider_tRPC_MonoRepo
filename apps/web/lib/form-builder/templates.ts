import type { ElementType, FormElement } from "./types";

type Field = Pick<FormElement, "type" | "props">;

const heading = (text: string): Field => ({ type: "text", props: { text } });
const field = (
  type: ElementType,
  question: string,
  required = false,
  placeholder?: string,
): Field => ({
  type,
  props: { question, required, placeholder },
});
const choice = (
  type: "single-select" | "multi-select" | "dropdown",
  question: string,
  options: string[],
  required = false,
): Field => ({
  type,
  props: { question, options, required },
});

export const templates = [
  {
    id: "demo-request",
    name: "Demo request",
    category: "Sales",
    description: "Learn about a prospect before the first product walkthrough.",
    elements: [
      heading("Request a product demo"),
      field("short-input", "Full name", true),
      field("email", "Work email", true),
      field("short-input", "Company name", true),
      choice("dropdown", "Company size", ["1–10", "11–50", "51–200", "201–1,000", "1,001+"]),
      field("long-input", "What would you like to see in the demo?"),
    ],
  },
  {
    id: "lead-qualification",
    name: "Lead qualification",
    category: "Sales",
    description: "Capture a buyer’s needs, budget and decision timeline.",
    elements: [
      heading("Tell us about your project"),
      field("short-input", "Full name", true),
      field("email", "Work email", true),
      field("short-input", "Company name", true),
      field("short-input", "Job title"),
      choice("single-select", "Buying timeline", [
        "Within 30 days",
        "1–3 months",
        "More than 3 months",
        "Just exploring",
      ]),
      choice("dropdown", "Estimated budget (USD)", [
        "Under $5,000",
        "$5,000–24,999",
        "$25,000–99,999",
        "$100,000 or more",
        "Undecided",
      ]),
      field("long-input", "What problem are you trying to solve?", true),
    ],
  },
  {
    id: "support-ticket",
    name: "Support ticket",
    category: "Support",
    description: "Collect a clear issue report and a reply address.",
    elements: [
      heading("Contact support"),
      field("email", "Account email", true),
      field("short-input", "Issue summary", true),
      field("short-input", "Affected product or feature"),
      choice(
        "single-select",
        "Impact",
        ["Work is blocked", "Some functionality is unavailable", "Minor issue or question"],
        true,
      ),
      field("long-input", "What happened?", true, "Include any steps that reproduce the issue."),
    ],
  },
  {
    id: "customer-feedback",
    name: "NPS feedback",
    category: "Research",
    description: "Collect a recommendation score and the reason behind it.",
    elements: [
      heading("Product feedback"),
      choice(
        "single-select",
        "How likely are you to recommend us? (0 = not at all, 10 = extremely likely)",
        Array.from({ length: 11 }, (_, i) => String(i)),
        true,
      ),
      field("long-input", "What is the main reason for your score?"),
    ],
  },
  {
    id: "employee-onboarding",
    name: "Employee onboarding",
    category: "People",
    description: "Prepare equipment and system access for a new hire.",
    elements: [
      heading("New hire setup"),
      field("short-input", "Employee name", true),
      field("date", "Start date", true),
      field("short-input", "Department", true),
      choice("single-select", "Preferred device", [
        "Mac laptop",
        "Windows laptop",
        "No device needed",
      ]),
      choice("multi-select", "Which tools do you need access to?", [
        "GitHub",
        "AWS Console",
        "Figma",
      ]),
    ],
  },
  {
    id: "vendor-onboarding",
    name: "Vendor onboarding",
    category: "Operations",
    description: "Collect supplier details and agree on payment terms.",
    elements: [
      heading("Vendor onboarding"),
      field("short-input", "Legal business name", true),
      field("short-input", "Primary contact name", true),
      field("email", "Primary contact email", true),
      field("long-input", "Services or products supplied", true),
      choice("dropdown", "Payment terms", [
        "Due on receipt",
        "Net 15",
        "Net 30",
        "Net 45",
        "Net 60",
      ]),
    ],
  },
  {
    id: "event-registration",
    name: "Event registration",
    category: "Events",
    description: "Register attendees and collect their attendance preferences.",
    elements: [
      heading("Event registration"),
      field("short-input", "Attendee name", true),
      field("email", "Confirmation email", true),
      choice("single-select", "How will you attend?", ["In person", "Online"], true),
      field("long-input", "Any dietary or accessibility requests?"),
    ],
  },
  {
    id: "job-application",
    name: "Job application",
    category: "People",
    description: "Collect contact details, role interest and relevant work.",
    elements: [
      heading("Job application"),
      field("short-input", "Full name", true),
      field("email", "Contact email", true),
      field("short-input", "Role you are applying for", true),
      field("url", "Portfolio or professional profile", false, "https://"),
      field("long-input", "Tell us about your relevant experience", true),
    ],
  },
];

export function instantiateTemplate(template: (typeof templates)[number]): FormElement[] {
  return template.elements.map(({ type, props }) => ({
    id: crypto.randomUUID(),
    type,
    props: structuredClone(props),
    x: 0,
    y: 0,
  }));
}
