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

## GFM's stream layout

Currently, this only has my personal stream layout,
which was made because my previous one wouldn't work on Linux's OBS (as it doesn't support file dialogs),
but also as a way to test if this type of application would work for streaming.

### Quick guide

To start the backend,
clone [gfm-speedrun-overlay](https://github.com/SirGFM/gfm-speedrun-overlay) and build and execute `gfm-speedrun-overlay/cmd/gfm-overlay`:

```sh
git clone git@github.com:SirGFM/gfm-speedrun-overlay.git
cd ./cmd/gfm-overlay
go build
./gfm-overlay
```

Then, in this repository, create a `.env` file with the backend's enpoint. Something like:

```sh
echo "API_URL=http://localhost:8080" > .env
```

Finally, simply start the frontend:

```sh
# XXX: The frontend will be accessible on port 3000.
npm run dev
```

### Deploy build

This frontend is meant to be built as static pages,
and then to be embedded into the backend.

First, build the static pages:

```sh
npm run build
```

Then, move the directory `build/` to the backend, renaming it to `res`.
