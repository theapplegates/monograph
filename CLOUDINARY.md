# Responsive Cloudinary images in Monograph

Cloudinary does all image decoding, resizing and format conversion. The site emits a native `picture` element with **JXL → AVIF → WebP** sources, plus a responsive WebP `img` fallback. It never uses `f_auto` or Sharp processing.

## Set up once

1. Run `npm install` with Node 22.12+.
2. Copy `.env.example` to `.env` and fill in your API key and API secret. The cloud name is already `paulapplegate-com`. Keep `.env` private.
3. The default cloud name is `paulapplegate-com`, including on the deployment host. `PUBLIC_CLOUDINARY_CLOUD_NAME` can override it. API credentials are used only by the upload command.

## Upload an image

```bash
npm run cloudinary:breakpoints -- "src/images/photo.jxl" --alt="Describe the photo" --sizes="(min-width: 768px) 720px, 100vw"
```

The path must point to your actual original image. JPEG, PNG and other Cloudinary-supported originals work too; the original does not have to be JXL. Local code reads bytes for a content hash, but does not decode them. Cloudinary returns the original dimensions and calculates responsive widths using WebP. Those widths are reused across all three output formats. JXL/AVIF variants are generated on delivery; the command does not pre-generate or verify every variant.

The command prints two choices:

- Paste the `<cloudinary-picture ...></cloudinary-picture>` snippet into a Markdown **or MDX** post. No import is required. Put it on its own line, with blank lines around it.
- Paste the `cover:` block into the post's frontmatter, replacing the old cover block. Preserve your `creditName` and `creditUrl` fields.

Uploads use content-addressed IDs under `monograph/` and do not overwrite existing assets. Repeating an identical upload reuses the ID. If Cloudinary omits breakpoint analysis for an existing image, the script uses standard widths capped to that image's actual width.

## Images already in Cloudinary

Use the public ID, dimensions and breakpoint widths you already know:

```html
<cloudinary-picture
  src="v1234567890/blog/my-photo"
  alt="A mountain lake"
  width="1600"
  height="1067"
  breakpoints="320,640,960,1280,1600"
  sizes="(min-width: 768px) 720px, 100vw"
></cloudinary-picture>
```

Replace the example ID and dimensions with real values. Use the public ID, not a full URL. The version prefix is optional, but recommended. Preserve any extension that is actually part of the public ID. Decorative images may use `alt=""`.

For `.astro` files, import `Picture` from `@/components/Picture.astro` and pass the same props. In Monograph post MDX, `<Picture ... />` is also provided through the component mapping. Ordinary `![alt](path)` syntax continues to display the original image; use the custom snippet for Cloudinary format selection.

## Existing demo covers

Existing local JPEG covers are rendered as ordinary unprocessed images so the starter still builds before you add credentials. They do **not** become Cloudinary images automatically. For each cover you want to convert, run:

```bash
npm run cloudinary:breakpoints -- "src/content/posts/your-post/cover.jpg" --alt="Describe the cover"
```

Use the printed `cover:` block. Covers receive eager loading, high fetch priority and responsive sizes. Social previews use a Cloudinary JPEG for broad crawler compatibility; the visible cover uses JXL → AVIF → WebP.

## What changed from the reference builds

Monograph has its own Markdown setup, so the Astro-Whono config, package versions and math-boundary plugin were not copied. Markdown runs raw HTML parsing before picture expansion. MDX gets a separate JSX-aware plugin, preserving its components. The shared URL helper keeps both renderers consistent.

This version preserves the original aspect ratio. Reference-only `devices` and `transformations` options are deliberately rejected; they need a separate art-direction implementation. Use `sizes` to describe the actual rendered width. No browser-side JavaScript is needed.

Astro's documented passthrough image service disables its default Sharp processing. The direct Sharp dependency is removed; Astro may still install Sharp as its own optional dependency. Installed does not mean used: a guarded build can reject every attempted Sharp import.

## Verify

```bash
npm run test:images
npm run check
npm run build
```

With Node 22.15+ or Node 24, additionally run:

```bash
npm run check:cloudinary-build
NODE_OPTIONS="--import=./scripts/no-sharp.mjs" npm run build
```

Inspect a converted image in browser developer tools: `picture` should contain JXL, AVIF and WebP sources in that order, each with `srcset` and `sizes`. Check the selected network response's Content-Type and dimensions. Browser support determines which format is selected; a failed JXL HTTP request does not automatically trigger an AVIF retry. Your Cloudinary account must allow all three transformations.

Sources: [Astro passthrough service](https://docs.astro.build/en/guides/images/#configure-no-op-passthrough-service), [Cloudinary responsive breakpoints](https://cloudinary.com/documentation/image_upload_api_reference#upload_optional_parameters).
