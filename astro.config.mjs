// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Badge tree is generated from _source/index.html — see scripts/import-badges.mjs.
import { badgeSidebar } from './src/sidebar.generated.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://girlsbuildbots.github.io',
	integrations: [
		starlight({
			title: 'Girls Build Bots',
			description:
				'Girl Scout troops and FIRST robotics teams, paired up — with ready-to-teach curriculum for 62 STEM badges.',
			customCss: ['./src/styles/custom.css'],
			components: {
				Footer: './src/components/Footer.astro',
				SocialIcons: './src/components/SocialIcons.astro',
			},
			// Starlight already emits per-page description, og:title/url/description
			// and twitter:card. Only the card image is missing — and it is added here
			// rather than as og:title/description overrides, because Starlight's head
			// merge would replace the per-page values with site-wide constants.
			// Twitter falls back to the og:* tags for title and description.
			head: [
				{
					tag: 'meta',
					attrs: {
						property: 'og:image',
						content: 'https://girlsbuildbots.github.io/og-image.png',
					},
				},
				{
					tag: 'meta',
					attrs: { property: 'og:image:width', content: '1200' },
				},
				{
					tag: 'meta',
					attrs: { property: 'og:image:height', content: '630' },
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:image:alt',
						content:
							'Girls Build Bots — STEM badges earned the real way, with real robots and real mentors.',
					},
				},
				{
					tag: 'meta',
					attrs: {
						name: 'twitter:image',
						content: 'https://girlsbuildbots.github.io/og-image.png',
					},
				},
			],
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/girlsbuildbots/girlsbuildbots.github.io',
				},
			],
			sidebar: [
				{ label: 'Pair up a troop & team', slug: 'pairing' },
				...badgeSidebar,
				{ label: 'Resources & downloads', slug: 'resources' },
			],
		}),
	],
});
