import { pictureData } from "../lib/cloudinary.mjs";

const element = (tagName, properties, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
});
const hastProperties = ({ srcset, fetchpriority, ...props }) => ({
  ...props,
  srcSet: srcset,
  ...(fetchpriority ? { fetchPriority: fetchpriority } : {}),
});

// Markdown only: run after rehype-raw. No image bytes are read locally.
export default function rehypeCloudinaryPicture() {
  return function walk(node) {
    if (!Array.isArray(node.children)) return;
    node.children = node.children.map((child) => {
      if (child.type === "element" && child.tagName === "cloudinary-picture") {
        const props = child.properties || {};
        // Reject unsupported reference-build features rather than silently ignoring crops.
        if (props.devices || props.transformations)
          throw new Error(
            "cloudinary-picture: devices/transformations are not supported in Monograph; use sizes and breakpoints.",
          );
        const { sources, img } = pictureData(props);
        return element(
          "picture",
          { className: props.className || props["picture-class"] || props.pictureClass },
          [
            ...sources.map((source) => element("source", hastProperties(source))),
            element("img", hastProperties(img)),
          ],
        );
      }
      walk(child);
      return child;
    });
  };
}
