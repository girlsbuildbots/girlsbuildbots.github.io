// Generates public/og-image.png (1200x630) — the Open Graph / Twitter card image.
//
// Original artwork only: the same robot mark as public/favicon.svg on the Girl
// Scout green accent, plus the three level tints. No GSUSA or FIRST logos.
//
// Text is drawn as vector paths (not <text>) so the render does not depend on
// which fonts happen to be installed on the build machine — librsvg silently
// drops missing families, which would otherwise ship a wordless card.
//
// Run: node scripts/make-og-image.mjs

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const OUT = fileURLToPath(new URL('../public/og-image.png', import.meta.url));

const W = 1200;
const H = 630;

const GREEN = '#00743F';
const GREEN_DEEP = '#00351d';
const BROWNIE = '#c2915f';
const JUNIOR = '#52b483';
const CADETTE = '#c9ae7b';

/**
 * Minimal single-stroke vector alphabet, drawn on a 0..1 em box with the
 * baseline at y=1. Enough glyphs for the two strings below; extend as needed.
 * Each glyph is a list of polylines in [x, y] pairs.
 */
const GLYPHS = {
	A: [[[0, 1], [0.5, 0], [1, 1]], [[0.19, 0.62], [0.81, 0.62]]],
	B: [[[0, 1], [0, 0], [0.66, 0], [0.86, 0.14], [0.86, 0.36], [0.66, 0.5], [0, 0.5]], [[0.66, 0.5], [0.9, 0.66], [0.9, 0.84], [0.68, 1], [0, 1]]],
	C: [[[0.94, 0.16], [0.72, 0], [0.28, 0], [0.04, 0.22], [0.04, 0.78], [0.28, 1], [0.72, 1], [0.94, 0.84]]],
	D: [[[0, 1], [0, 0], [0.6, 0], [0.92, 0.26], [0.92, 0.74], [0.6, 1], [0, 1]]],
	E: [[[0.92, 0], [0, 0], [0, 1], [0.92, 1]], [[0, 0.5], [0.72, 0.5]]],
	G: [[[0.94, 0.16], [0.72, 0], [0.28, 0], [0.04, 0.22], [0.04, 0.78], [0.28, 1], [0.72, 1], [0.94, 0.82], [0.94, 0.56], [0.56, 0.56]]],
	H: [[[0, 0], [0, 1]], [[0.88, 0], [0.88, 1]], [[0, 0.52], [0.88, 0.52]]],
	I: [[[0.5, 0], [0.5, 1]]],
	L: [[[0, 0], [0, 1], [0.86, 1]]],
	M: [[[0, 1], [0, 0], [0.5, 0.62], [1, 0], [1, 1]]],
	N: [[[0, 1], [0, 0], [0.88, 1], [0.88, 0]]],
	O: [[[0.28, 0], [0.72, 0], [0.96, 0.22], [0.96, 0.78], [0.72, 1], [0.28, 1], [0.04, 0.78], [0.04, 0.22], [0.28, 0]]],
	R: [[[0, 1], [0, 0], [0.66, 0], [0.9, 0.16], [0.9, 0.4], [0.66, 0.56], [0, 0.56]], [[0.52, 0.56], [0.92, 1]]],
	S: [[[0.94, 0.14], [0.7, 0], [0.26, 0], [0.04, 0.16], [0.04, 0.36], [0.26, 0.5], [0.72, 0.5], [0.94, 0.64], [0.94, 0.84], [0.72, 1], [0.24, 1], [0.02, 0.86]]],
	T: [[[0.5, 0], [0.5, 1]], [[0, 0], [1, 0]]],
	U: [[[0, 0], [0, 0.76], [0.24, 1], [0.66, 1], [0.9, 0.76], [0.9, 0]]],
	W: [[[0, 0], [0.22, 1], [0.5, 0.34], [0.78, 1], [1, 0]]],
	Y: [[[0, 0], [0.46, 0.5], [0.92, 0]], [[0.46, 0.5], [0.46, 1]]],
	' ': [],
};

/** Advance width per glyph, in em. */
const ADVANCE = { I: 0.62, M: 1.18, W: 1.24, ' ': 0.46 };

/** Render `text` as SVG polylines starting at (x, baseline y), em size `size`. */
function vectorText(text, { x, y, size, color, weight }) {
	const letterGap = 0.16 * size;
	let cursor = x;
	const parts = [];
	for (const raw of text.toUpperCase()) {
		const glyph = GLYPHS[raw];
		if (glyph === undefined) throw new Error(`make-og-image: no glyph for ${JSON.stringify(raw)}`);
		const advance = (ADVANCE[raw] ?? 0.94) * size;
		for (const line of glyph) {
			const d = line
				.map(([gx, gy], i) => `${i === 0 ? 'M' : 'L'}${(cursor + gx * advance).toFixed(2)} ${(y - size + gy * size).toFixed(2)}`)
				.join(' ');
			parts.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round"/>`);
		}
		cursor += advance + letterGap;
	}
	return { svg: parts.join(''), width: cursor - x - letterGap };
}

/** Centre `text` horizontally on the canvas by measuring, then re-emitting. */
function centeredText(text, opts) {
	const { width } = vectorText(text, { ...opts, x: 0 });
	return vectorText(text, { ...opts, x: (W - width) / 2 }).svg;
}

/** The favicon robot, scaled from its 32x32 viewBox and centred at (cx, top). */
function robot(cx, top, scale) {
	const t = `translate(${cx - 16 * scale} ${top}) scale(${scale})`;
	return `<g transform="${t}">
		<circle cx="16" cy="4.5" r="2" fill="#fff"/>
		<rect x="15" y="5.5" width="2" height="4.5" fill="#fff"/>
		<rect x="6.5" y="9" width="19" height="15" rx="4.5" fill="#fff"/>
		<circle cx="12" cy="15.5" r="2.1" fill="${GREEN}"/>
		<circle cx="20" cy="15.5" r="2.1" fill="${GREEN}"/>
		<rect x="12" y="19.4" width="8" height="2.2" rx="1.1" fill="${GREEN}"/>
		<rect x="3" y="13" width="2.5" height="6" rx="1.25" fill="#fff"/>
		<rect x="26.5" y="13" width="2.5" height="6" rx="1.25" fill="#fff"/>
	</g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
	<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
			<stop offset="0" stop-color="${GREEN}"/>
			<stop offset="1" stop-color="${GREEN_DEEP}"/>
		</linearGradient>
	</defs>
	<rect width="${W}" height="${H}" fill="url(#bg)"/>
	${robot(W / 2, 74, 3.6)}
	${centeredText('GIRLS BUILD BOTS', { y: 350, size: 62, color: '#ffffff', weight: 11 })}
	${centeredText('STEM BADGES EARNED THE REAL WAY', { y: 440, size: 27, color: '#b7e6cb', weight: 5 })}
	${centeredText('WITH REAL ROBOTS AND REAL MENTORS', { y: 496, size: 27, color: '#b7e6cb', weight: 5 })}
	<rect x="0" y="${H - 14}" width="${W / 3}" height="14" fill="${BROWNIE}"/>
	<rect x="${W / 3}" y="${H - 14}" width="${W / 3}" height="14" fill="${JUNIOR}"/>
	<rect x="${(2 * W) / 3}" y="${H - 14}" width="${W / 3}" height="14" fill="${CADETTE}"/>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile(OUT, png);

const meta = await sharp(png).metadata();
console.log(`wrote ${OUT} — ${meta.width}x${meta.height}, ${(png.length / 1024).toFixed(1)} KB`);
