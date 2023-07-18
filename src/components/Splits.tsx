'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import ScrollingText from '@/components/ScrollingText';
import Timer from '@/components/Timer';

export interface Segment {
	/** This segment's name. */
	name: string;
	/** The fastest completition time, in milliseconds, for this segment.
	 * Note that this is just the delta time!!! */
	best?: number;
	/** The (expected/best) starting time, in milliseconds, for this segment. */
	start?: number;
	/** The ending time, in milliseconds, for this segment.
	 * If the segment wasn't completed, this should be expected/best ending time.
	 * If it was completed, this should be actual ending time. */
	end?: number;
	/** Whether this segment was skipped. */
	skipped?: boolean;
}

interface SegmentProps extends Segment {
	/** The component's width, in pixels. */
	widthPx: number;
	/** The component's height, in pixels. */
	heightPx: number;
	/** The current time, for the active segment. */
	currentTime?: number;
	/** ClassName applied to the segment. */
	className?: string;
	/** Whether the segment is over. */
	finished?: boolean;
}

/** A single segment within a run. */
function SegmentViewer(props: SegmentProps) {
	/** The width of the name within the segment's container. */
	const nameWidth = Math.floor(props.widthPx * 0.5);
	/** The width of the diff within the segment's container. */
	const diffWidth = Math.floor(props.widthPx * 0.2);
	/** The width of the best/achieved time within the segment's container. */
	const timeWidth = props.widthPx - diffWidth - nameWidth;

	let deltaTime;
	if (props.skipped) {
		/* Remove the delta time if the segment was skipped. */
	} else if (
		props.finished &&
		props.end &&
		props.best &&
		typeof props.start !== 'undefined'
	) {
		/* If the segment is complete, show the delta regardless. */
		deltaTime = props.end - (props.best + props.start);
	} else if (props.end && props.currentTime) {
		/* Otherwise, calculate the delta for the current segment
		 * and only display it if it's at least -30s. */
		deltaTime = props.currentTime - props.end;
		if (deltaTime < -30000) {
			deltaTime = undefined;
		}
	}

	let endTime;
	if (props.end) {
		endTime = props.end;
	}

	return (
		<div
			className={props.className}
			style={{
				width: props.widthPx,
				height: props.heightPx,
				display: 'inline-flex',
			}}
		>
			<ScrollingText
				scrollSpeed={100}
				widthPx={nameWidth}
				heightPx={props.heightPx}
				separator="--"
			>
				{props.name}
			</ScrollingText>

			{deltaTime ? (
				<Timer
					timeMs={deltaTime}
					widthPx={diffWidth}
					heightPx={props.heightPx}
					showHour={false}
					hideHourTens={true}
					hideMin={true}
					hideMinTens={true}
					showMs={Math.abs(deltaTime) < 60000}
					showSign={true}
				/>
			) : (
				<div
					style={{
						width: diffWidth,
						height: props.heightPx,
						display: 'flex' as const,
						flexDirection: 'column' as const,
						alignItems: 'center' as const,
						placeContent: 'space-evenly' as const,
					}}
				>
					{props.skipped ? <p>skipped</p> : null}
				</div>
			)}

			{endTime ? (
				<Timer
					timeMs={endTime}
					widthPx={timeWidth}
					heightPx={props.heightPx}
					showHour={false}
					hideHourTens={true}
					hideMin={true}
					showMs={endTime < 60000}
				/>
			) : (
				<div
					style={{
						width: timeWidth,
						height: props.heightPx,
						display: 'flex' as const,
						flexDirection: 'column' as const,
						alignItems: 'center' as const,
						placeContent: 'space-evenly' as const,
					}}
				>
					<p>n/a</p>
				</div>
			)}
		</div>
	);
}

export interface SplitsProps {
	/** Every segment in this run. */
	segments: Segment[];
	/** The currently active segment. */
	current: number;
	/** The component's width, in pixels. */
	widthPx: number;
	/** The component's height, in pixels. */
	heightPx: number;
	/** The height for each individual entry, in pixels. */
	entryHeightPx: number;
	/** The current time, for the active segment. */
	currentTime?: number;
	/** ClassName applied to the current segment. */
	currentClass?: string;
}

export default function Splits(props: SplitsProps) {
	/** Reference to the splits div, so the current one may be focused on. */
	const dom = useRef<null | HTMLDivElement>(null);

	/** Unpack the component's props. */
	const {
		segments,
		current,
		widthPx,
		heightPx,
		entryHeightPx,
		currentTime,
		currentClass,
	} = props;

	/** List of segments, separated by whether they've been finished or not. */
	const [finishedSegments, currentSegments, pendingSegments] = useMemo(() => {
		let finished = [];
		let active = [];
		let pending = [];

		for (let idx = 0; idx < segments.length; idx++) {
			const entry = segments[idx];

			if (idx < current) {
				finished.push(entry);
			} else if (idx == current) {
				active.push(entry);
			} else {
				pending.push(entry);
			}
		}

		return [finished, active, pending];
	}, [segments, current]);

	/* Bring the current split into view. */
	useLayoutEffect(() => {
		if (dom.current == null) {
			return;
		}

		const idx = Math.min(current, dom.current.childElementCount - 1);
		dom.current.children[idx].scrollIntoView();
	}, [current]);

	return (
		<div
			style={{
				width: widthPx,
				height: heightPx,
				overflow: 'hidden',
			}}
			ref={dom}
		>
			{finishedSegments.map((segment) => (
				<SegmentViewer
					{...segment}
					widthPx={widthPx}
					heightPx={entryHeightPx}
					key={'done-' + segment.name}
					finished={true}
				/>
			))}
			{currentSegments.map((segment) => (
				<SegmentViewer
					{...segment}
					widthPx={widthPx}
					heightPx={entryHeightPx}
					key={'cur-' + segment.name}
					/* Add the current time and the custom class name in the current split. */
					currentTime={currentTime}
					className={currentClass}
				/>
			))}
			{pendingSegments.map((segment) => (
				<SegmentViewer
					{...segment}
					widthPx={widthPx}
					heightPx={entryHeightPx}
					key={'next-' + segment.name}
				/>
			))}
		</div>
	);
}
