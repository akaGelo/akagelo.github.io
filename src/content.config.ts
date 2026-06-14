import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const photos = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/photos" }),
  schema: z.object({
    title: z.string().default(""),
    image: z.string(),
    src: z.string().optional(),
    date: z.coerce.date(),
    type: z.string().default("other"),
    tags: z.array(z.string()).default([]),
    caption: z.string().default(""),
    featured: z.boolean().default(false),
    favorite: z.boolean().default(false),
    rating: z.number().optional(),
  }),
});

export const collections = { photos };
