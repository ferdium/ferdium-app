type ColorMethod = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'named';

export const isValidColor = (color: string, method?: ColorMethod): boolean => {
  const patterns: Record<ColorMethod, RegExp> = {
    hex: /^#(?:[\dA-Fa-f]{3,4}){1,2}$/,
    rgb: /^rgb\((\d{1,3}%?,\s*){2}\d{1,3}%?\)$/,
    rgba: /^rgba\((\d{1,3}%?,\s*){3}[\d.]+\)$/,
    hsl: /^hsl\(\d{1,3}(?:,\s*\d{1,3}%){2}\)$/,
    hsla: /^hsla\(\d{1,3}(?:,\s*\d{1,3}%){2},\s*[\d.]+\)$/,
    named: /^[A-Za-z]+$/,
  };

  if (method) {
    return patterns[method].test(color);
  }

  // Check all methods if no specific method is provided
  return Object.values(patterns).some(regex => regex.test(color));
};
