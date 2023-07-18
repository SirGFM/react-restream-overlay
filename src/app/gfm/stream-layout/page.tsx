'use client';

import './layout.css';

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useLayoutEffect,
} from 'react';
import { useSearchParams } from 'next/navigation';
import ScrollingText from '@/components/ScrollingText';
import Splits, { Segment, SplitsProps } from '@/components/Splits';
import Timer, { TimerProps } from '@/components/Timer';
import req from '@/utils/req';
import reqForm from '@/utils/reqForm';
import { Config, ConfigType } from '../config/Config';

interface TimeResponse {
	/** The current time, in milliseconds. */
	Time: number;
}

interface RunSegment {
	/** This segment's name. */
	Name: string;
	/** The fastest completition time, in milliseconds, for this segment. */
	BestTime: number;
	/** The starting time, in milliseconds, for this segment. */
	StartTime: number;
	/** The ending time, in milliseconds, for this segment. */
	EndTime: number;
	/** Whether this segment was skipped. */
	Skipped: boolean;
}

interface RunSplits {
	/** The category's name. */
	Name: string;
	/** The list of segments in this category. */
	Splits: RunSegment[];
	/** The list of best segments in this category. */
	Best: RunSegment[];
	/** The current segment. */
	Current: number;
	/** Whether the run has started. */
	Started: boolean;
}

/**
 * atoi converts the value to a number.
 *
 * @param {any} value - The value to be converted.
 * @param {number} fallback - The value used if the conversion fail.
 * @return {number} - The converted number (or fallback, on error).
 */
function atoi(value: any, fallback: number = 0.25): number {
	const num = parseFloat(value + '');
	return num ? num : fallback;
}

interface BlockProps {
	/** The width of the object contained within this block. */
	width: number;
	/** The height of the object contained within this block. */
	height: number;
	/** The object(s) contained within this block. */
	children: React.ReactNode;
}

function Block(props: BlockProps) {
	return (
		<div
			className="bg-block block-outter"
			style={{
				width: props.width + 12,
				height: props.height + 12,
			}}
		>
			<div
				className="bg-block block-inner"
				style={{
					position: 'relative',
					left: 4,
					top: 4,
					width: props.width,
					height: props.height,
				}}
			>
				{props.children}
			</div>
		</div>
	);
}

function Title(props: BlockProps) {
	return (
		<Block {...props}>
			<div id="title" className="m5x7 outlined">
				<ScrollingText
					scrollSpeed={100}
					widthPx={props.width}
					heightPx={props.height}
					separator="--"
				>
					{props.children}
				</ScrollingText>
			</div>
		</Block>
	);
}

function LocalTimer(props: TimerProps) {
	return (
		<Block width={props.widthPx} height={props.heightPx}>
			<div id="timer" className="m5x7 outlined">
				<Timer
					widthPx={props.widthPx}
					heightPx={props.heightPx}
					timeMs={props.timeMs}
					showHour={true}
					showMs={true}
				/>
			</div>
		</Block>
	);
}

function LocalSplits(props: SplitsProps) {
	return (
		<Block width={props.widthPx} height={props.heightPx}>
			<div id="splits" className="m5x7 outlined">
				<Splits {...props} />
			</div>
		</Block>
	);
}

export default function StreamLayout() {
	/** The inner width of the browser's window. */
	const [windowWidth, setWindowWidth] = useState(0);
	/** The inner height of the browser's window. */
	const [windowHeight, setWindowHeight] = useState(0);
	/** The game's width. */
	const [width, setWidth] = useState(960);
	/** The game's height. */
	const [height, setHeight] = useState(540);
	/** The game's title. */
	const [title, setTitle] = useState("It's a mystery 👻");
	/** The elapsed time for the current run. */
	const [time, setTime] = useState(0);
	/** The endpoint from where the elapsed time is retrieved.
	 * It must respond with a TimeResponse. */
	const [timerUrl, setTimerUrl] = useState('');
	/** The token for the current category/run, if any. */
	const [runToken, setRunToken] = useState('');
	/** The current segment within the active run, if any. */
	const [curSegment, setCurSegment] = useState(0);
	/** The list of segments within the active run, if any. */
	const [segments, setSegments] = useState<null | Segment[]>(null);
	/** How often the configuration should be refreshed. */
	const [configRefreshRate, setConfigRefreshRate] = useState(2500);
	/** How often the timer/segments should be refreshed. */
	const [timerRefreshRate, setTimerRefreshRate] = useState(117);

	/** Load various data from the query string. */
	const queryString = useSearchParams();
	const minTitleHeight = atoi(queryString.get('min_title_height'), 100.0);
	const sidebarPercentage = atoi(queryString.get('sidebar_percentage'), 0.25);
	const splitEntryHeight = atoi(queryString.get('split_entry_height'), 48);
	const queryConfigUrl = queryString.get('config_url') ?? '/ram_store/config';
	const queryRunUrl = queryString.get('run_url') ?? '/run';
	const defaultTimerUrl = queryString.get('timer_url') ?? '/timer';

	/** The sidebar's minimum width. */
	const baseSidebarWidth = windowWidth * sidebarPercentage;

	/**
	 * onUpdate fetches the current configuration from the server
	 * and update the layout accordingly.
	 */
	const onUpdate = useCallback(() => {
		reqForm(queryConfigUrl, ConfigType, undefined, (form) => {
			const config = form as Config;

			if (!(config.title && config.width && config.height)) {
				console.error('incomplete data');
				return;
			}
			setTitle(config.title);
			setWidth(config.width);
			setHeight(config.height);

			if (config['config-refresh']) {
				setConfigRefreshRate(config['config-refresh']);
			}
			if (config['timer-refresh']) {
				setTimerRefreshRate(config['timer-refresh']);
			}

			/* Either set or clear the run token. */
			const _runToken = config['run-token'] ?? '';
			setRunToken(_runToken);

			/* Set timer URL based on either the run or on the regular timer. */
			if (_runToken) {
				setTimerUrl(`${queryRunUrl}/timer/${_runToken}`);
			} else {
				setTimerUrl(defaultTimerUrl);
				setSegments(null);
			}

			/* Give preference to hiding the timer altogether. */
			if (!!config['hide-timer']) {
				setTimerUrl('');
			}
		});
	}, [
		queryConfigUrl,
		defaultTimerUrl,
		queryRunUrl,
		setTitle,
		setWidth,
		setHeight,
		setTimerUrl,
		setSegments,
		setRunToken,
	]);

	/* Configure the timer on which the layout is updated. */
	useEffect(() => {
		const id = setInterval(onUpdate, configRefreshRate);

		return () => {
			clearInterval(id);
		};
	}, [onUpdate, configRefreshRate]);

	/**
	 * onTimer fetches the current elapsed time and segments from the server.
	 */
	const onTimer = useCallback(() => {
		/* Update the elapsed time. */
		if (!timerUrl) {
			return;
		}

		req(timerUrl, undefined, (data) => {
			const resp = data as TimeResponse;

			setTime(resp.Time);
		});

		/* Update the current segments, if set. */
		if (runToken) {
			req(`${queryRunUrl}/splits/${runToken}`, undefined, (data) => {
				const resp = data as RunSplits;

				/* Convert each retrieved segment to the expected interface. */
				let _segments: Segment[] = [];
				/* XXX: tsc isn't able to get the correct type when doing for (let idx in resp.Splits). */
				for (let idx = 0; idx < resp.Splits.length; idx++) {
					const segment = resp.Splits[idx];
					const best = resp.Best.at(idx) ?? resp.Splits[idx];

					let tmp: Segment = {
						name: segment.Name,
					};

					if (best.BestTime && best.BestTime > 0) {
						tmp['best'] = best.BestTime;
					}
					if (segment.EndTime && segment.EndTime > 0) {
						tmp['end'] = segment.EndTime;
					}

					/* Account for the first segment starting at 0.*/
					if (typeof best.StartTime !== 'undefined' && best.StartTime >= 0) {
						tmp['start'] = best.StartTime;
					}

					tmp['skipped'] = segment.Skipped;

					_segments.push(tmp);
				}

				/* Update the segments and the active one. */
				setSegments(_segments);
				setCurSegment(resp.Current);
			});
		}
	}, [queryRunUrl, timerUrl, runToken, setCurSegment]);

	/* Configure the timer on which the timer/segments is updated. */
	useEffect(() => {
		if (!timerUrl) {
			return;
		}

		const id = setInterval(onTimer, timerRefreshRate);

		return () => {
			clearInterval(id);
		};
	}, [timerUrl, onTimer, timerRefreshRate]);

	/**
	 * onResize updates the window's dimension whenever it changes.
	 */
	const onResize = useCallback(() => {
		if (typeof window === 'undefined') {
			console.error("window isn't defined!");
			return;
		}

		setWindowWidth(window.innerWidth);
		setWindowHeight(window.innerHeight);
	}, [setWindowWidth, setWindowHeight]);

	/* Obtain the window's dimensions. */
	useLayoutEffect(() => {
		onResize();

		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, [onResize]);

	/* Calculate the actual dimensions of the viewport. */

	/** The resolved sidebar's width. */
	let calcSideWidth = baseSidebarWidth;
	/** The resolved game's width. */
	let calcWidth = width;
	/** The resolved game's height. */
	let calcHeight = height;

	if (width && height && windowWidth && windowHeight) {
		let multiplier = 0.0;

		/* Calculate the view multiplier, as if it were to fill the window vertically. */
		calcHeight = windowHeight;
		multiplier = calcHeight / height;

		calcWidth = Math.floor(width * multiplier);
		if (baseSidebarWidth + calcWidth < windowWidth) {
			/* The view fits horizontally when fully stretched vertically.
			 * Simply calculate the size of the sidebar. */
			calcSideWidth = windowWidth - calcWidth;
		} else {
			/* Calculate the view multiplier, filling the window horizontally. */
			calcWidth = windowWidth - baseSidebarWidth;
			multiplier = calcWidth / width;

			calcHeight = height * multiplier;
		}
	}

	calcWidth = Math.floor(calcWidth);
	calcHeight = Math.floor(calcHeight);
	calcSideWidth = windowWidth - calcWidth;

	/** The dimensions of the bottom panel. */
	const bottom = {
		active: windowHeight - calcHeight >= minTitleHeight,
		height: Math.max(windowHeight - calcHeight, 0),
	};

	return (
		<div id="layout">
			<div
				id="game"
				style={{
					position: 'absolute',
					top: 0,
					left: calcSideWidth,
					width: calcWidth,
					height: calcHeight,
				}}
			/>

			<div
				id="sidebar"
				className="center"
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: calcSideWidth,
					height: windowHeight,
				}}
			>
				{!bottom.active ? (
					<Title
						width={Math.floor(calcSideWidth * 0.9)}
						height={minTitleHeight}
					>
						{title}
					</Title>
				) : null}

				{segments ? (
					<LocalSplits
						segments={segments}
						current={curSegment}
						widthPx={Math.floor(calcSideWidth * 0.9)}
						heightPx={Math.floor(windowHeight * 0.5)}
						entryHeightPx={splitEntryHeight}
						currentTime={time}
						currentClass="cur-split"
					/>
				) : null}

				{timerUrl ? (
					<LocalTimer
						widthPx={256}
						heightPx={72}
						timeMs={time}
						showHour={true}
						showMs={true}
					/>
				) : null}
			</div>

			<div
				id="bottombar"
				className="center"
				style={{
					position: 'absolute',
					top: calcHeight,
					left: calcSideWidth,
					width: calcWidth,
					height: bottom.height,
				}}
			>
				{bottom.active ? (
					<Title
						width={Math.floor(calcWidth * 0.75)}
						height={Math.floor(bottom.height * 0.75)}
					>
						{title}
					</Title>
				) : null}
			</div>
		</div>
	);
}
