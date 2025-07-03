export type Hex = {
  q: number; // axial coordinate q
  r: number; // axial coordinate r
  s: number; // axial coordinate s (q + r + s = 0)
};

export type Point = {
  x: number;
  y: number;
};

export type HexagonLayout = {
  orientation: Orientation;
  size: Point;
  origin: Point;
};

export type Orientation = {
  f0: number;
  f1: number;
  f2: number;
  f3: number;
  b0: number;
  b1: number;
  b2: number;
  b3: number;
  start_angle: number; // in multiples of 60 degrees
};

// Pointy top orientation
export const pointy_top: Orientation = {
  f0: Math.sqrt(3.0),
  f1: Math.sqrt(3.0) / 2.0,
  f2: 0.0,
  f3: 3.0 / 2.0,
  b0: Math.sqrt(3.0) / 3.0,
  b1: -1.0 / 3.0,
  b2: 0.0,
  b3: 2.0 / 3.0,
  start_angle: 0.5,
};

// Flat top orientation
export const flat_top: Orientation = {
  f0: 3.0 / 2.0,
  f1: 0.0,
  f2: Math.sqrt(3.0) / 2.0,
  f3: Math.sqrt(3.0),
  b0: 2.0 / 3.0,
  b1: 0.0,
  b2: -1.0 / 3.0,
  b3: Math.sqrt(3.0) / 3.0,
  start_angle: 0.0,
};

export function hexToPixel(hex: Hex, layout: HexagonLayout): Point {
  const M = layout.orientation;
  const size = layout.size;
  const origin = layout.origin;
  const x = (M.f0 * hex.q + M.f1 * hex.r) * size.x;
  const y = (M.f2 * hex.q + M.f3 * hex.r) * size.y;
  return { x: x + origin.x, y: y + origin.y };
}

export function getHexVertices(hex: Hex, layout: HexagonLayout): Point[] {
  const corners: Point[] = [];
  const center = hexToPixel(hex, layout);
  for (let i = 0; i < 6; i++) {
    const angle = (2.0 * Math.PI * (layout.orientation.start_angle - i)) / 6.0;
    corners.push({
      x: center.x + layout.size.x * Math.cos(angle),
      y: center.y + layout.size.y * Math.sin(angle),
    });
  }
  return corners;
}

export function generateHexGrid(rows: number, cols: number): Hex[] {
  const hexagons: Hex[] = [];
  for (let r = 0; r < rows; r++) {
    const r_offset = Math.floor(r / 2);
    for (let q = -r_offset; q < cols - r_offset; q++) {
      hexagons.push({ q, r, s: -q - r });
    }
  }
  return hexagons;
}
