'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';

interface AutoResizeTextProp {
	/** The component's exact width. */
	widthPx: number;
	/** The component's exact height. */
	heightPx: number;
	/** A starting value for the font size, in pixels.
	 * The actual 'fontSize' for the component shall be less than this,
	 * if the text wouldn't fir the dimensions,
	 * however it won't ever be larger than this. */
	baseFontSize: number;
	/** The actual text of the component. */
	children: React.ReactNode;
}

export default function AutoResizeText(props: AutoResizeTextProp) {
	/** The possibly shrank down element's font size. */
	const [fontSize, setFontSize] = useState(props.baseFontSize);
	/** Number of redraws that the font size kept stable. */
	const [retries, setRetries] = useState(0);
	/** Whether the font should be forcefully shrank in the next redraw. */
	const [delayRetry, setDelayRetry] = useState(false);
	/** The resized, visible text. */
	const [finalInput, setFinalInput] = useState<null | React.ReactNode>(null);
	/** Reference to the hidden label used to gradually shrink the text. */
	const text = useRef<null | HTMLParagraphElement>(null);

	/** How many passes is required to assume that the resize was successful. */
	const maxRetries = 5;
	/** How many times the layout effect was called sequentially. */
	const layoutEffectCount = useRef(0);
	/** A value smaller than whatever causes React to throw a
	 * 'Maximum update depth exceeded' exception. */
	const maxLayoutEffectCount = 20;

	/* If the (child) text has changed, queue a full re-size. */
	useEffect(() => {
		layoutEffectCount.current = 0;
		setFontSize(props.baseFontSize);
		setRetries(0);
		setDelayRetry(false);
		setFinalInput(null);
	}, [props.children, props.baseFontSize]);

	/* Force the layout effect to re-run. */
	useEffect(() => {
		if (delayRetry) {
			layoutEffectCount.current = 0;
			setDelayRetry(false);

			/* Force retries to a new value,
			 * ensuring that the layout effect is called. */
			setRetries(-1);
		}
	}, [delayRetry]);

	/* Decrease the font a few times, queueing another update for later (if needed). */
	useLayoutEffect(() => {
		if (!text.current) {
			console.error('text.current not set!');
			return;
		}

		/* Ensure that the effect won't be displayed. */
		setFinalInput(null);

		/* Track the number of times this effect was called,
		 * avoiding React from throwing a 'Maximum update depth exceeded' exception. */
		layoutEffectCount.current++;

		/* Simply decrease the font slightly until it fits. */
		let reset = false;
		if (fontSize > 1 && text.current.scrollHeight > text.current.offsetHeight) {
			reset = true;

			setFontSize((old) => {
				if (layoutEffectCount.current >= maxLayoutEffectCount) {
					return old;
				}

				return old - 1;
			});
		}

		setRetries((old) => {
			if (layoutEffectCount.current >= maxLayoutEffectCount) {
				return old;
			}

			if (reset) {
				return 0;
			} else if (old < maxRetries) {
				return old + 1;
			} else {
				setFinalInput(props.children);
				return old;
			}
		});

		if (layoutEffectCount.current >= maxLayoutEffectCount) {
			setDelayRetry(true);
		}
	}, [fontSize, retries, props.children]);

	const divStyle = {
		width: props.widthPx + 'px',
		height: props.heightPx + 'px',
		maxHeight: props.heightPx + 'px',
		lineHeight: props.heightPx + 'px',
		display: 'inline-flex',
		justifyContent: 'center',
		flexDirection: 'row' as const,
	};

	const pStyle = {
		fontSize: fontSize + 'px',
		maxHeight: props.heightPx + 'px',
		lineHeight: props.heightPx + 'px',
		/* Allow words to break as soon as it's passed the element's width. */
		overflowWrap: 'anywhere' as const,
	};

	/* Use a hidden div to calculate the actual size,
	 * only setting 'finalInput' after it's stabilized. */
	return (
		<>
			<div
				style={{
					...divStyle,
					visibility: 'hidden',
					position: 'absolute',
				}}
			>
				<p style={pStyle} ref={text}>
					{props.children}
				</p>
			</div>

			<div
				style={{
					...divStyle,
					textAlign: 'center',
				}}
			>
				<p style={pStyle}>{finalInput}</p>
			</div>
		</>
	);
}
