import type { FormElement, FormState } from "./types";

type Appearance = Pick<
  FormState,
  "theme" | "backgroundUrl" | "customAppBg" | "customCanvasBg" | "customTextColor"
>;

const defaultAppearance: Appearance = {
  theme: "auto",
  backgroundUrl: null,
  customAppBg: null,
  customCanvasBg: null,
  customTextColor: null,
};

export function readFormDocument(stored: unknown): {
  fields: FormElement[];
  appearance: Appearance;
} {
  if (stored && typeof stored === "object" && "fields" in stored && Array.isArray(stored.fields)) {
    const appearance =
      "appearance" in stored && stored.appearance && typeof stored.appearance === "object"
        ? stored.appearance
        : {};
    return { fields: stored.fields, appearance: { ...defaultAppearance, ...appearance } };
  }
  // Existing forms store the field array directly.
  return { fields: Array.isArray(stored) ? stored : [], appearance: defaultAppearance };
}

export function writeFormDocument({
  elements,
  theme,
  backgroundUrl,
  customAppBg,
  customCanvasBg,
  customTextColor,
}: FormState) {
  if (theme === "auto" && !backgroundUrl && !customAppBg && !customCanvasBg && !customTextColor)
    return elements;
  return {
    fields: elements,
    appearance: { theme, backgroundUrl, customAppBg, customCanvasBg, customTextColor },
  };
}
