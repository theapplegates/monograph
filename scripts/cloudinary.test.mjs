import test from "node:test";
import assert from "node:assert/strict";
import { pictureData, imageUrl } from "../src/lib/cloudinary.mjs";
import { snippets } from "./cloudinary-breakpoints.mjs";
import rehypeCloudinaryPicture from "../src/plugins/rehype-cloudinary-picture.mjs";
import remarkCloudinaryPicture from "../src/plugins/remark-cloudinary-picture.mjs";

process.env.PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
const props = {
  src: "v123/folder/photo one",
  alt: "A photo",
  width: 1000,
  height: 600,
  breakpoints: "1200,640,320,640",
  sizes: "(min-width: 800px) 720px, 100vw",
};

test("format preference, sizes and responsive fallback; no misleading upscaled width descriptors", () => {
  const result = pictureData(props);
  assert.deepEqual(
    result.sources.map((s) => s.type),
    ["image/jxl", "image/avif", "image/webp"],
  );
  for (const source of result.sources) {
    assert.equal(source.sizes, props.sizes);
    assert.match(source.srcset, /320w, .*640w, .*1000w$/);
    assert.ok(source.srcset.includes(`f_${source.type.slice(6)}`));
    assert.ok(!source.srcset.includes("f_auto"));
  }
  assert.equal(result.img.srcset, result.sources[2].srcset);
  assert.match(result.img.src, /photo%20one$/);
});
test("invalid metadata fails early; decorative alt is accepted", () => {
  assert.throws(() => pictureData({ ...props, width: 0 }));
  assert.throws(() => pictureData({ ...props, breakpoints: "320,nope" }));
  assert.throws(() => pictureData({ ...props, alt: undefined }));
  assert.equal(pictureData({ ...props, alt: "" }).img.alt, "");
  assert.throws(() => imageUrl("https://example.com/x", 320, "jxl"));
});
test("Markdown expansion and MDX mapping", () => {
  const tree = {
    children: [{ type: "element", tagName: "cloudinary-picture", properties: props }],
  };
  rehypeCloudinaryPicture()(tree);
  assert.equal(tree.children[0].tagName, "picture");
  assert.equal(tree.children[0].children[0].properties.type, "image/jxl");
  assert.ok(tree.children[0].children[3].properties.srcSet);
  const mdx = { type: "mdxJsxFlowElement", name: "cloudinary-picture", attributes: [] };
  remarkCloudinaryPicture()(mdx);
  assert.equal(mdx.name, "CloudinaryPicture");
});
test("uploader output uses server dimensions and escapes both HTML and MDX", () => {
  const output = snippets(
    {
      version: 123,
      public_id: "folder/photo",
      width: 1000,
      height: 600,
      responsive_breakpoints: [{ breakpoints: [{ width: 320 }, { width: 1000 }] }],
    },
    { alt: 'A "quote" & {braces}', sizes: "100vw" },
  );
  assert.match(output, /breakpoints="320,1000"/);
  assert.match(output, /&quot;quote&quot; &amp; &#123;braces&#125;/);
  assert.match(output, /cloudinary:v123\/folder\/photo/);
});
