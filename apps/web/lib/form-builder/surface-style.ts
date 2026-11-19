// A custom canvas can be lighter or darker than the surrounding workspace.
function contrastingInk(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/../g)!
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
  const luminance = 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;
  return luminance > 0.179 ? "#000000" : "#ffffff";
}

export function formSurfaceStyle(background?: string | null, text?: string | null) {
  const hex = /^#[\da-f]{6}$/i;
  return {
    backgroundColor: background || (text && hex.test(text) ? contrastingInk(text) : undefined),
    color: text || (background && hex.test(background) ? contrastingInk(background) : undefined),
  };
}
