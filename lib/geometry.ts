export type Point = { x: number; y: number };
export type Box = Point & { width: number; height: number };
export const selectionBox = (a: Point, b: Point): Box => ({
  x: Math.min(a.x, b.x),
  y: Math.min(a.y, b.y),
  width: Math.abs(b.x - a.x),
  height: Math.abs(b.y - a.y),
});
export const overlaps = (a: Box, b: Box) =>
  a.x <= b.x + b.width &&
  a.x + a.width >= b.x &&
  a.y <= b.y + b.height &&
  a.y + a.height >= b.y;
export function drawingPoint(
  client: Point,
  rect: Box,
  width = 1000,
  height = 620,
): Point {
  const scale = Math.min(rect.width / width, rect.height / height);
  return {
    x: (client.x - rect.x - (rect.width - width * scale) / 2) / scale,
    y: (client.y - rect.y - (rect.height - height * scale) / 2) / scale,
  };
}
export const issues = [
  {
    x: 282,
    y: 394,
    code: "IBC 1015.3",
    title: "Guardrail required for fall protection",
    short: "GUARDRAIL HEIGHT",
  },
  {
    x: 650,
    y: 394,
    code: "IBC 1011.11",
    title: "Handrails required at stairway",
    short: "HANDRAIL REQUIRED",
  },
  {
    x: 503,
    y: 297,
    code: "ADA 404.2.4",
    title: "Door maneuvering clearance",
    short: "DOOR CLEARANCE",
  },
];
