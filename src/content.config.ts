import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				/**
				 * Girl Scout level this page belongs to. Written by the import
				 * scripts onto every badge page and level overview; drives the
				 * per-level accent palette (src/components/Head.astro) and the
				 * level band. Absent on site pages, which keep the green accent.
				 */
				level: z.enum(['brownie', 'junior', 'cadette']).optional(),
			}),
		}),
	}),
};
