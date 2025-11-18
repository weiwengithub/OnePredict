/**
 * 把十六进制颜色转成 rgba 字符串
 * @param hex  如 "#28C04E" | "#28c04e" | "#abc" | "#28C04EFF"
 * @param alpha 可选，0~1；若 hex 自带 alpha（8位），优先使用 hex 的 alpha
 */
export function hexToRgba(hex: string, alpha?: number): string {
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  let h = hex.slice(1);
  if (h.length === 3) {
    // #RGB -> #RRGGBB
    h = h.split("").map(c => c + c).join("");
  }

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  // 如果是 8 位，后两位为 alpha
  let aFromHex: number | undefined;
  if (h.length === 8) {
    aFromHex = parseInt(h.slice(6, 8), 16) / 255;
  }

  const a = (aFromHex ?? (alpha ?? 1));
  return `rgba(${r}, ${g}, ${b}, ${+a.toFixed(4)})`;
}

export function hexToRgbTriplet(hex: string): [number, number, number] {
  const m = hex.trim().replace('#', '');
  const h = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}
