import { z } from "zod";

export const createIdeaSchema = z.object({
  title: z.string().trim().min(3).max(100),
  pitch: z.string().trim().min(10).max(200),
  problem: z.string().trim().min(20),
  solution: z.string().trim().min(20),
  targetAudience: z.string().trim().min(5),

  businessType: z.enum([
    "B2B",
    "B2C",
    "D2C",
    "Marketplace",
    "SaaS",
  ]),

  geography: z.enum([
    "Global",
    "North America",
    "Europe",
    "Asia",
    "India",
    "Other",
  ]),

  stage: z.enum([
    "Idea",
    "Prototype",
    "MVP",
    "Beta",
    "Launched",
    "Scaling",
  ]),

  revenueModel: z.string().optional(),
  price: z.string().optional(),
  competitors: z.string().optional(),
  assumption: z.string().optional(),
  additionalContext: z.string().optional(),
});

export const updateIdeaSchema = createIdeaSchema.partial();