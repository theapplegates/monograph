import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { categories } from "@/config/categories";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      /** Must match one of the entries in src/config/categories.ts. */
      category: z.enum(categories),
      date: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.object({
        name: z.string(),
        role: z.string(),
      }),
      /**
       * Optional feature image. Monograph's post feeds are deliberately
       * text-only, so a cover is only ever shown on the post itself.
       */
      cover: z
        .object({
          src: z.union([z.string().startsWith("cloudinary:"), image()]),
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional(),
          breakpoints: z.array(z.number().int().positive()).min(1).optional(),
          alt: z.string(),
          creditName: z.string().optional(),
          creditUrl: z.url().optional(),
        })
        .superRefine((cover, ctx) => {
          if (
            typeof cover.src === "string" &&
            cover.src.startsWith("cloudinary:") &&
            (!cover.width || !cover.height || !cover.breakpoints?.length)
          ) {
            ctx.addIssue({
              code: "custom",
              message:
                "Cloudinary covers require width, height and breakpoints from cloudinary:breakpoints.",
            });
          }
        })
        .optional(),
      /** Surfaces the post in the "Featured" list in the home sidebar. */
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
