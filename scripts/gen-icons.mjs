// Rasterises the SVG app icons to the PNG sizes the PWA manifest and Android need.
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public", "icons");

const icon = readFileSync(join(iconsDir, "icon.svg"));
const maskable = readFileSync(join(iconsDir, "icon-maskable.svg"));

const jobs = [
  { svg: icon, size: 192, out: "icon-192.png" },
  { svg: icon, size: 512, out: "icon-512.png" },
  { svg: maskable, size: 512, out: "icon-maskable-512.png" },
  // Android launcher / Play assets
  { svg: icon, size: 1024, out: "icon-1024.png" },
];

await Promise.all(
  jobs.map(({ svg, size, out }) =>
    sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(join(iconsDir, out)),
  ),
);

console.log(`✔ generated ${jobs.length} PNG icons in public/icons`);
