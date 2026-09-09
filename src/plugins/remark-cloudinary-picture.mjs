// MDX uses JSX nodes, so it must not inherit Markdown's rehype-raw pass.
// Resolve the same no-import snippet through the page's component mapping.
export default function remarkCloudinaryPicture() {
  return function walk(node) {
    if (
      (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
      node.name === "cloudinary-picture"
    ) {
      if (
        node.attributes.some((attribute) => ["devices", "transformations"].includes(attribute.name))
      ) {
        throw new Error(
          "cloudinary-picture: devices/transformations are not supported in Monograph; use sizes and breakpoints.",
        );
      }
      node.name = "CloudinaryPicture";
    }
    node.children?.forEach(walk);
  };
}
