import {z} from "zod";

export const createOrganizationSchema = z.object({
     name : z
            .string()
            .trim()
            .min(2 , "organinzation name must be of 2 character"),

    slug : z
           .string()
           .trim()
           .min(3 , "slug must be of 3 character")
           .regex(
             /^[a-z0-9-]+$/,
            "Slug can only contain lowercase letters, numbers, and hyphens"
           )
});


export type createOrganizationInput = z.infer<typeof createOrganizationSchema>