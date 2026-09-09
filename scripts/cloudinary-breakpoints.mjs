import { v2 as cloudinary } from "cloudinary";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { pictureData } from "../src/lib/cloudinary.mjs";

export function snippets(result, { alt, sizes }) {
  const src = `v${result.version}/${result.public_id}`;
  const widths = [
    ...new Set(
      (result.responsive_breakpoints || []).flatMap((group) =>
        group.breakpoints.map((b) => b.width),
      ),
    ),
  ].sort((a, b) => a - b);
  // An existing content-addressed upload may not return breakpoint analysis.
  const breakpoints = widths.length
    ? widths
    : [...new Set([320, 640, 960, 1280, 1600, 2400].map((w) => Math.min(w, result.width)))];
  pictureData({ src, width: result.width, height: result.height, breakpoints, alt, sizes });
  const escape = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("{", "&#123;")
      .replaceAll("}", "&#125;");
  return `Markdown or MDX (no import needed):\n\n<cloudinary-picture src="${escape(src)}" alt="${escape(alt)}" width="${result.width}" height="${result.height}" breakpoints="${breakpoints.join(",")}" sizes="${escape(sizes)}"></cloudinary-picture>\n\nCover frontmatter (keep any existing creditName/creditUrl):\n\ncover:\n  src: ${JSON.stringify(`cloudinary:${src}`)}\n  alt: ${JSON.stringify(alt)}\n  width: ${result.width}\n  height: ${result.height}\n  breakpoints: [${breakpoints.join(", ")}]\n`;
}

export async function main(args = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      alt: { type: "string" },
      sizes: { type: "string", default: "100vw" },
      help: { type: "boolean" },
    },
  });
  if (values.help) {
    console.log(
      'npm run cloudinary:breakpoints -- "path/to/photo.jxl" --alt="Description" --sizes="(min-width: 768px) 720px, 100vw"',
    );
    return;
  }
  if (positionals.length !== 1 || values.alt === undefined)
    throw new Error(
      'Provide one local image path and --alt="Description" (or --alt="" for a decorative image). Use --help for an example.',
    );
  const cloud =
    process.env.PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    "paulapplegate-com";
  if (!cloud || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)
    throw new Error(
      "Set PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.",
    );
  cloudinary.config({
    cloud_name: cloud,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  const file = path.resolve(positionals[0]);
  // Hash bytes only; never decode the image. New contents get a new ID.
  const hash = createHash("sha256")
    .update(await readFile(file))
    .digest("hex")
    .slice(0, 24);
  const stem =
    path
      .basename(file, path.extname(file))
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 60) || "image";
  console.error(
    "Uploading original image; Cloudinary will measure it and calculate responsive widths...",
  );
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "image",
    public_id: `monograph/${stem}-${hash}`,
    overwrite: false,
    timeout: 120000,
    responsive_breakpoints: [
      {
        create_derived: true,
        transformation: "c_limit,q_auto,f_webp",
        min_width: 320,
        max_width: 2400,
        bytes_step: 20000,
        max_images: 8,
      },
    ],
  });
  console.log(snippets(result, { alt: values.alt, sizes: values.sizes }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`Cloudinary: ${error.message || "Upload failed"}`);
    process.exitCode = 1;
  });
}
