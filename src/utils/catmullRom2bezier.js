export function catmullRom2bezier(pts, closed = false) {
  if (!pts || pts.length < 2) return "";
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = (i === 0)
      ? (closed ? pts[pts.length - 1] : pts[0])
      : pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = (i + 2 < pts.length)
      ? pts[i + 2]
      : (closed ? pts[0] : p2);
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  if (closed) {
    d += " Z";
  }
  return d;
}
