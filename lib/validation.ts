import { z } from "zod"

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const issueCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(1),
})

export const issueUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["open", "closed"]).optional(),
})

export const commentCreateSchema = z.object({
  body: z.string().min(1),
})

export const issuesQuerySchema = z.object({
  status: z.enum(["open", "closed", "all"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().optional(),
})
