import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const students = defineCollection({
  loader: glob({
    base: "./src/content/students",
    pattern: "**/*.md",
  }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    initials: z.string(),
    order: z.number(),
    email: z.string(),
    website: z.string(),
    interestLabel: z.string().default("Research Interests"),
    research: z.array(z.string()),
  }),
});

const collaborators = defineCollection({
  loader: glob({
    base: "./src/content/collaborators",
    pattern: "**/*.md",
  }),
  schema: z.object({
    name: z.string(),
    image: z.string(),
    affiliation: z.string(),
    affiliationUrl: z.string(),
    specialty: z.string(),
    project: z.string(),
    website: z.string(),
    order: z.number()
  }),
});

const directors = defineCollection({
  loader: glob({
    base: "./src/content/directors",
    pattern: "**/*.md",
  }),
  schema: z.object({
    order: z.number(),

    name: z.string(),

    image: z.string(),

    title: z.string(),

    role: z.string(),

    badges: z.array(z.string()),

    background1: z.string(),

    background2: z.string(),

    research: z.array(z.string()),

    email: z.string(),

    office: z.string(),

    education: z.string(),

    facultyProfile: z.string(),

    cv: z.string(),

    highlights: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
        })
      )
      .default([]),
  }),
});

const workshops = defineCollection({
  loader: glob({
    base: "./src/content/workshops",
    pattern: "**/*.md",
  }),
  schema: z.object({
    order: z.number(),

    title: z.string(),

    featured: z.boolean(),

    instructors: z.string(),

    date: z.string(),

    description: z.string(),

    topics: z.array(z.string()),

    buttonText: z.string(),

    buttonLink: z.string(),

    resources: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
        })
      )
      .default([]),
  }),
});

const publications = defineCollection({
  loader: glob({
    base: "./src/content/publications",
    pattern: "**/*.md",
  }),
  schema: z.object({
    order: z.number(),

    category: z.enum([
      "featured",
      "project",
      "working-paper",
    ]),

    title: z.string(),

    authors: z.string(),

    source: z.string(),

    buttonText: z.string(),

    buttonLink: z.string(),
  }),
});


const presentations = defineCollection({
  loader: glob({
    base: "./src/content/presentations",
    pattern: "**/*.md",
  }),
  schema: z.object({
    order: z.number(),
    category: z.enum(["upcoming", "archive"]),
    year: z.number(),
    title: z.string(),
    date: z.string(),
    location: z.string(),
    speaker: z.string(),
    descriptionHtml: z.array(z.string()),
    links: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
        })
      )
      .default([]),
    photos: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          caption: z.string(),
        })
      )
      .default([]),
  }),
});

const news = defineCollection({
  loader: glob({
    base: "./src/content/news",
    pattern: "**/*.md",
  }),
  schema: z.object({
    title: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string().optional(),
    link: z.string().optional(),
  }),
});

const initiatives = defineCollection({
  loader: glob({
    base: "./src/content/initiatives",
    pattern: "**/*.md",
  }),
  schema: z.object({
    title: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string().optional(),
    link: z.string().optional(),
  }),
});

export const collections = {
    students,
    collaborators,
    directors,
    workshops,
    publications,
    presentations,
    news,
    initiatives,
};