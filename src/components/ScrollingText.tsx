'use client';

import { useState } from 'react';
import Ruler from './Ruler';

interface ScrollingTextProps {
	/** Scrolling speed, in pixels/second. */
	scrollSpeed: number;
	/** The component's exact width. */
	widthPx: number;
	/** The component's exact height. */
	heightPx: number;
	/** The actual text of the component. */
	children: React.ReactNode;
	/** An element used to indicate the end of the text,
	 * separating one iteration from the next. */
	separator?: string;
}

export default function ScrollingText(props: ScrollingTextProps) {
	/** The width of the text input. */
	const [textWidth, setTextWidth] = useState(0);
	/** The width of the separator. */
	const [separatorWidth, setSeparatorWidth] = useState(0);
	/** Whether this component should scroll (or whether it fits in the provided dimensions). */
	const scroll = textWidth > props.widthPx;
	/** Suffix added after the text to separate the repetition from the scrolled text.
	 * The &nbsp; must be written in Unicode, as NextJS (or something) screws it up otherwise.
	 * Also, <p> would ignore the leading/trailing space on the <Ruler>... */
	const textSuffix = props.separator
		? `\u00a0${props.separator}\u00a0`
		: '\u00a0';
	/** Width of the actual text being scrolled. */
	const width = textWidth + (scroll ? separatorWidth : 0);
	/** How long a single rotation of the scrolled text takes. */
	const duration = width / props.scrollSpeed;
	/** A unique name (within this component) for the current animation. */
	const animName = `scroll-${width}-${props.scrollSpeed}`;

	return (
		<>
			<Ruler widthSetter={setTextWidth}>
				<p>{props.children}</p>
			</Ruler>
			<Ruler widthSetter={setSeparatorWidth}>
				<p>{textSuffix}</p>
			</Ruler>

			<div className="scrolling_div">
				<p className="scrolling_p">
					{props.children}
					{scroll ? textSuffix : null}
					{scroll ? props.children : null}
				</p>
			</div>

			{/* XXX: This must be hard-coded into the component,
			 * as it won't work otherwise...
			 *
			 * I.e.: as absurd as this sounds,
			 * moving the contents of this component to a variable causes it to stop working!
			 */}
			<style jsx>{`
				div.scrolling_div {
					width: ${props.widthPx}px;
					height: ${props.heightPx}px;
					max-height: ${props.heightPx}px;
					line-height: ${props.heightPx}px;
					${!scroll ? 'display: inline-flex;' : ''}
					${!scroll ? 'justify-content: center;' : ''}
					${!scroll ? 'flex-direction: row;' : ''}
				}

				p.scrolling_p {
					max-height: ${props.heightPx}px;
					line-height: ${props.heightPx}px;
					overflow: hidden;
					white-space: nowrap;
					${scroll ? 'animation-duration: ' + duration + 's;' : ''}
					${scroll ? 'animation-name: ' + animName + ';' : ''}
					${scroll ? 'animation-iteration-count: infinite;' : ''}
					${scroll ? 'animation-timing-function: linear;' : ''}
				}

				@keyframes ${animName} {
					from {
						text-indent: 0px;
					}
					to {
						text-indent: -${width}px;
					}
				}
			`}</style>
		</>
	);
}
