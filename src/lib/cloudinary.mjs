// URL construction only. Cloudinary performs all decoding, resizing and encoding.
export const formats = ["jxl", "avif", "webp"];

export function cloudName() {
  return (
    process.env.PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    import.meta.env?.PUBLIC_CLOUDINARY_CLOUD_NAME ||
    import.meta.env?.CLOUDINARY_CLOUD_NAME ||
    "paulapplegate-com"
  );
}

export function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0)
    throw new Error(`[cloudinary-picture] ${label} must be a positive integer.`);
  return number;
}

export function imageUrl(src, width, format, cloud = cloudName()) {
  if (!cloud || !/^[a-zA-Z0-9_-]+$/.test(cloud))
    throw new Error("Set PUBLIC_CLOUDINARY_CLOUD_NAME in .env and on your build host.");
  if (
    typeof src !== "string" ||
    !src.trim() ||
    src.startsWith("/") ||
    src.includes(":") ||
    src.split("/").some((p) => !p || p === "." || p === "..")
  ) {
    throw new Error(
      "[cloudinary-picture] src must be a Cloudinary public ID (optionally prefixed with v123/), not a file path or URL.",
    );
  }
  if (![...formats, "jpg"].includes(format)) throw new Error("Unsupported image format.");
  const id = src.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${cloud}/image/upload/c_limit,w_${positiveInteger(width, "width")},q_auto,f_${format}/${id}`;
}

export function pictureData(props) {
  const width = positiveInteger(props.width, "width");
  const height = positiveInteger(props.height, "height");
  if (typeof props.alt !== "string")
    throw new Error(
      "[cloudinary-picture] alt is required; use an empty string for decorative images.",
    );
  let raw = props.breakpoints;
  if (typeof raw === "string") raw = raw.trim().startsWith("[") ? JSON.parse(raw) : raw.split(",");
  if (raw && !Array.isArray(raw)) raw = raw.breakpoints;
  if (!Array.isArray(raw) || !raw.length)
    throw new Error(
      "[cloudinary-picture] breakpoints are required. Run npm run cloudinary:breakpoints -- <file>.",
    );
  const widths = [
    ...new Set(
      raw
        .map((b) =>
          positiveInteger(typeof b === "object" && b !== null ? b.width : b, "breakpoint"),
        )
        .map((w) => Math.min(w, width)),
    ),
  ].sort((a, b) => a - b);
  const sizes = props.sizes || "100vw";
  const srcset = (format) =>
    widths.map((w) => `${imageUrl(props.src, w, format)} ${w}w`).join(", ");
  return {
    sources: formats.map((format) => ({ type: `image/${format}`, srcset: srcset(format), sizes })),
    img: {
      src: imageUrl(props.src, widths.at(-1), "webp"),
      srcset: srcset("webp"),
      sizes,
      width,
      height,
      alt: props.alt,
      loading: props.loading || "lazy",
      decoding: "async",
      fetchpriority: props.fetchpriority || "auto",
    },
  };
}
