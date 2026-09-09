// Temporary real Markdown + MDX posts exercise Astro's complete rendering path.
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { basename } from "node:path";
import assert from "node:assert/strict";

const dirs = [];
try {
  for (const extension of ["md", "mdx"]) {
    const dir = await mkdtemp("src/content/posts/cloudinary-test-");
    dirs.push(dir);
    await writeFile(
      `${dir}/index.${extension}`,
      `---
title: Cloudinary rendering test
excerpt: Temporary test fixture
category: Engineering
date: 2026-01-01
author:
  name: Test Author
  role: Test
cover:
  src: "cloudinary:sample"
  alt: Cover fixture
  width: 864
  height: 576
  breakpoints: [320, 640, 864]
---

<cloudinary-picture src="sample" alt="Inline &quot;photo&quot; &#123;test&#125;" width="864" height="576" breakpoints="320,640,864" sizes="(min-width: 768px) 720px, 100vw"></cloudinary-picture>
`,
    );
  }
  const run = spawnSync(
    process.execPath,
    ["--import=./scripts/no-sharp.mjs", "node_modules/.bin/astro", "build"],
    {
      stdio: "inherit",
      env: { ...process.env, PUBLIC_CLOUDINARY_CLOUD_NAME: "demo", ASTRO_TELEMETRY_DISABLED: "1" },
    },
  );
  assert.equal(run.status, 0, "Astro build must pass with Sharp imports blocked");
  for (const dir of dirs) {
    const html = await readFile(`dist/post/${basename(dir).toLowerCase()}/index.html`, "utf8");
    const pictures = html.match(/<picture\b[^>]*>[\s\S]*?<\/picture>/g) || [];
    assert.equal(pictures.length, 2, "cover and inline image must both expand");
    for (const picture of pictures) {
      assert.deepEqual(
        [...picture.matchAll(/type="(image\/[^"]+)"/g)].map((m) => m[1]),
        ["image/jxl", "image/avif", "image/webp"],
      );
      assert.equal((picture.match(/srcset=/g) || []).length, 4);
      assert.equal((picture.match(/sizes=/g) || []).length, 4);
      assert.ok(!picture.includes("f_auto"));
      assert.ok(picture.includes("https://res.cloudinary.com/demo/image/upload/"));
    }
    assert.ok(!html.includes("<cloudinary-picture"));
    assert.match(html, /f_jpg\/sample/);
    assert.ok(!html.includes("/_image?"));
  }
  console.log("Markdown, MDX and Cloudinary covers passed; Sharp imports were blocked.");
} finally {
  for (const dir of dirs) await rm(dir, { recursive: true, force: true });
  // Avoid retaining generated fixture pages, feeds or collection cache.
  await rm("dist", { recursive: true, force: true });
  await rm(".astro", { recursive: true, force: true });
  await rm("node_modules/.astro", { recursive: true, force: true });
}
