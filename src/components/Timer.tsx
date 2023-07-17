'use client';

import { RefObject, useRef, useState, useLayoutEffect } from 'react';

/**
 * getMaxWidth retrieves the maximum width between a previous value and an element.
 *
 * @param {number} cur - The current value.
 * @param {RefObject<HTMLElement>} ref - The HTML element to be inspected.
 * @return {number} The greatest between cur and the element's width.
 */
function getMaxWidth(cur: number, ref: RefObject<HTMLElement>): number {
	if (ref.current && ref.current.offsetWidth > cur) {
		return ref.current.offsetWidth;
	}
	return cur;
}

export interface TimerProps {
	/** The current time, in milliseconds. */
	timeMs: number;
	/** The component's exact width. */
	widthPx: number;
	/** The component's exact height. */
	heightPx: number;
	/** Whether the hour digits should be shown before the time reaches 1 hour. */
	showHour?: boolean;
	/** Whether the tens digit of the hour should be hidden before the time reaches 10 hours. */
	hideHourTens?: boolean;
	/** Whether the minute digits should be hidden before the time reaches 1 min. */
	hideMin?: boolean;
	/** Whether the tens digit of the minute should be hidden before the time reaches 10 minutes. */
	hideMinTens?: boolean;
	/** Whether the millisecond digits should be shown at all. */
	showMs?: boolean;
	/** Whether a positive/negative sign should precede the timer. */
	showSign?: boolean;
}

export default function Timer(props: TimerProps) {
	/** The width of the largest digit, so every digit may have the same dimension. */
	const [maxWidth, setMaxWidth] = useState(0);
	/** Reference to each digit,to calculate their width. */
	const span0 = useRef<HTMLElement>(null);
	const span1 = useRef<HTMLElement>(null);
	const span2 = useRef<HTMLElement>(null);
	const span3 = useRef<HTMLElement>(null);
	const span4 = useRef<HTMLElement>(null);
	const span5 = useRef<HTMLElement>(null);
	const span6 = useRef<HTMLElement>(null);
	const span7 = useRef<HTMLElement>(null);
	const span8 = useRef<HTMLElement>(null);
	const span9 = useRef<HTMLElement>(null);
	const spanMinus = useRef<HTMLElement>(null);
	const spanPlus = useRef<HTMLElement>(null);

	/* Calculate the width of the largest digit
	 * to ensure that digits don't move around
	 * if the font isn't monospaced. */
	useLayoutEffect(() => {
		let maxWidth = 0;

		maxWidth = getMaxWidth(maxWidth, span0);
		maxWidth = getMaxWidth(maxWidth, span1);
		maxWidth = getMaxWidth(maxWidth, span2);
		maxWidth = getMaxWidth(maxWidth, span3);
		maxWidth = getMaxWidth(maxWidth, span4);
		maxWidth = getMaxWidth(maxWidth, span5);
		maxWidth = getMaxWidth(maxWidth, span6);
		maxWidth = getMaxWidth(maxWidth, span7);
		maxWidth = getMaxWidth(maxWidth, span8);
		maxWidth = getMaxWidth(maxWidth, span9);
		if (props.showSign) {
			maxWidth = getMaxWidth(maxWidth, spanMinus);
			maxWidth = getMaxWidth(maxWidth, spanPlus);
		}
		setMaxWidth(maxWidth);
	}, [props.showSign]);

	/* Calculate each digit in the timer. */
	let _time = props.timeMs;

	let _sign = '+';
	if (_time < 0) {
		_time *= -1;
		_sign = '-';
	}

	let ms = _time % 1000;
	_time = Math.trunc(_time / 1000);
	let sec = _time % 60;
	_time = Math.trunc(_time / 60);
	let min = _time % 60;
	_time = Math.trunc(_time / 60);
	let hour = _time % 24;

	let lowMs, midMs, highMs;
	if (props.showMs) {
		lowMs = ms % 10;
		midMs = Math.trunc((ms % 100) / 10);
		highMs = Math.trunc(ms / 100);
	}
	let lowSec = sec % 10;
	let highSec = Math.trunc(sec / 10);
	let lowMin = min % 10;
	let highMin = Math.trunc(min / 10);
	let lowHour = hour % 10;
	let highHour = Math.trunc(hour / 10);

	const baseDigitStyle = {
		textAlign: 'center' as const,
		lineHeight: props.heightPx + 'px',
	};
	const digitStyle = {
		...baseDigitStyle,
		display: 'inline-block',
		width: maxWidth + 'px',
	};

	const showHour = hour > 0 || props.showHour;
	const showHourTens = hour > 10 || !props.hideHourTens;
	const showMin = showHour || min > 0 || !props.hideMin;
	const showMinTens = showHour || min > 10 || !props.hideMinTens;

	/* Use a hidden div to calculate the actual size of each digit,
	 * in case the font isn't monospaced. */
	return (
		<>
			<div
				style={{
					visibility: 'hidden',
					position: 'absolute',
				}}
			>
				<span style={baseDigitStyle} ref={span0}>
					0
				</span>
				<span style={baseDigitStyle} ref={span1}>
					1
				</span>
				<span style={baseDigitStyle} ref={span2}>
					2
				</span>
				<span style={baseDigitStyle} ref={span3}>
					3
				</span>
				<span style={baseDigitStyle} ref={span4}>
					4
				</span>
				<span style={baseDigitStyle} ref={span5}>
					5
				</span>
				<span style={baseDigitStyle} ref={span6}>
					6
				</span>
				<span style={baseDigitStyle} ref={span7}>
					7
				</span>
				<span style={baseDigitStyle} ref={span8}>
					8
				</span>
				<span style={baseDigitStyle} ref={span9}>
					9
				</span>
				<span style={baseDigitStyle} ref={spanMinus}>
					-
				</span>
				<span style={baseDigitStyle} ref={spanPlus}>
					+
				</span>
			</div>

			<div
				style={{
					width: props.widthPx + 'px',
					height: props.heightPx + 'px',
					display: 'inline-flex',
					justifyContent: 'center',
				}}
			>
				{props.showSign ? <span style={digitStyle}>{_sign}</span> : null}
				{showHour ? (
					<>
						{showHourTens ? <span style={digitStyle}>{highHour}</span> : null}
						<span style={digitStyle}>{lowHour}</span>
						<span style={baseDigitStyle}>:</span>
					</>
				) : null}
				{showMin ? (
					<>
						{showMinTens ? <span style={digitStyle}>{highMin}</span> : null}
						<span style={digitStyle}>{lowMin}</span>
						<span style={baseDigitStyle}>:</span>
					</>
				) : null}
				<span style={digitStyle}>{highSec}</span>
				<span style={digitStyle}>{lowSec}</span>
				{props.showMs ? (
					<>
						<span style={baseDigitStyle}>.</span>
						<span style={digitStyle}>{highMs}</span>
						<span style={digitStyle}>{midMs}</span>
						<span style={digitStyle}>{lowMs}</span>
					</>
				) : null}
			</div>
		</>
	);
}
