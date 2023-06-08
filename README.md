# GFM's Restream Overlay

A simple react-based restream overlay, for races and other online events.

Some of the intended features are:

- Automatically resizing text
	- For texts that are longer than its container
	- Keeps the entire text visible in a single line
	- Shrinks the font size until it fits
- Scrolling text
	- For texts that are longer than its container
	- Scrolls the text around
- Croppable containers
	- Mainly for iframes
	- Toggle between shaded-cropped area and zoomed in view
- OBS controls
	- Switch scene
	- Control audio volumes
- Managed streams
	- Twitch stream with simple channel selection
	- Audio controls
	- Quality controls, maybe?

---

# NextJS's readme

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
