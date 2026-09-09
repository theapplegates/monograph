// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import rehypeSlug from "rehype-slug";
import { siteConfig } from "./src/config/site.ts";
import { codeThemes, codeDefaultColor } from "./src/config/code.ts";

import mdx from "@astrojs/mdx";
import rehypeRaw from "rehype-raw";
import rehypeCloudinaryPicture from "./src/plugins/rehype-cloudinary-picture.mjs";
import remarkCloudinaryPicture from "./src/plugins/remark-cloudinary-picture.mjs";

const shikiConfig = /** @type {const} */ ({
  themes: codeThemes,
  defaultColor: codeDefaultColor,
});

export default defineConfig({
  site: siteConfig.siteUrl,
  image: { service: passthroughImageService() },
  integrations: [
    sitemap({
      filter: (page) => page !== new URL("/search/", siteConfig.siteUrl).toString(),
    }),
    mdx({
      processor: unified({ remarkPlugins: [remarkCloudinaryPicture], rehypePlugins: [rehypeSlug] }),
    }),
  ],
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeSlug, rehypeRaw, rehypeCloudinaryPicture],
    }),
    shikiConfig,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
