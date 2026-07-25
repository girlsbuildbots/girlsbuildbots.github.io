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
			},
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
