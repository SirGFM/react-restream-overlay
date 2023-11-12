'use client';

import './drum-overlay.css';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import atoi from '@/utils/atoi';
import req from '@/utils/req';
import { useDrumConfig } from './DrumConfig';

interface Message {
	/** Mapping of MIDI events to a comma-separated list of (keyboard) keys pressed by this event. */
	map?: { [key in string]: string };
	/** Date when each MIDI event was last pressed, in a parseable format. */
	midi?: { [key in string]: string };
	/** The state for the (keyboard) keys affected by the MIDI events. */
	keys?: { [key in string]: boolean };
}

interface OverlayComponentProps {
	/** The image's className. */
	className: string;
	/** Whether this image should currently be visible or not. */
	lastPress: string;
	/** How long an activation stays visible (in ms).
	 * Defaults to 200ms if not specified. */
	duration?: number;
}

/**
 * OverlayComponent displays the component for a while after it was pressed.
 *
 * @param {string} className - Class(es) applied to the component.
 * @param {string} lastPress - Parseable date when the button it represents was last pressed.
 * @param {string} duration - For how long the component should be visible.
 */
function OverlayComponent(props: OverlayComponentProps) {
	const [visible, setVisible] = useState(false);

	const { className, lastPress, duration } = props;
	const defDuration = duration ?? 200;

	/* If a date in the future wa provided,
	 * set the component as visible
	 * and configure the timer that will hide it again. */
	useEffect(() => {
		if (!lastPress) {
			return;
		}

		const pressDate = Date.parse(lastPress);
		if (!pressDate) {
			console.error(`failed to parse the press date: ${lastPress}`);
			return;
		}

		const timeout = defDuration + pressDate - Date.now();
		if (timeout <= 0) {
			console.warn('timeout already expired');
			return;
		}

		const id = setTimeout(() => setVisible(false), timeout);
		setVisible(true);
		return () => {
			clearTimeout(id);
		};
	}, [setVisible, lastPress, defDuration]);

	if (!visible) {
		return null;
	}
	return <div className={className} />;
}

export default function DrumOverlay() {
	/** Load various data from the query string. */
	const queryString = useSearchParams();
	const refreshRate = atoi(queryString.get('refresh_rate_ms'), 25);
	const drumUrl = queryString.get('drum_url') ?? '/ram_store/drums';

	/** Retrieve the setters/getters for the drum state. */
	const {
		dateSetter,
		bassDate,
		crash1Date,
		crash2Date,
		hihatPedalDate,
		hihatDate,
		rideDate,
		snareDate,
		tom1Date,
		tom2Date,
		tom3Date,
		tom4Date,
		keysSetter,
		bassKeys,
		crash1Keys,
		crash2Keys,
		hihatPedalKeys,
		hihatKeys,
		rideKeys,
		snareKeys,
		tom1Keys,
		tom2Keys,
		tom3Keys,
		tom4Keys,
	} = useDrumConfig();

	/**
	 * onUpdate fetches the current drum state
	 * and update the overlay accordingly.
	 */
	const onUpdate = useCallback(() => {
		req(drumUrl, undefined, (data) => {
			const msg = data as Message;

			/* Update the last pressed date on every MIDI event. */
			if (msg.midi) {
				Object.entries(msg.midi).forEach(([ev, date]) => {
					const setter = dateSetter[ev];
					if (!setter) {
						console.error(`missing date setter for evevent ${ev}`);
						return;
					}
					setter(date);
				});
			}

			/* Update the keys displayed on top of the pads. */
			if (msg.map) {
				Object.entries(msg.map).forEach(([ev, keys]) => {
					const setter = keysSetter[ev];
					if (!setter) {
						console.error(`missing date setter for evevent ${ev}`);
						return;
					}
					setter(keys);
				});
			}
		});
	}, [drumUrl, dateSetter, keysSetter]);

	/* Configure the timer on which the layout is updated. */
	useEffect(() => {
		const id = setInterval(onUpdate, refreshRate);

		return () => {
			clearInterval(id);
		};
	}, [onUpdate, refreshRate]);

	return (
		<>
			<div className="base-drum drum-kit" />
			<OverlayComponent className="bass-drum drum-kit" lastPress={bassDate} />
			<OverlayComponent
				className="crash1-drum drum-kit"
				lastPress={crash1Date}
			/>
			<OverlayComponent
				className="crash2-drum drum-kit"
				lastPress={crash2Date}
			/>
			<OverlayComponent
				className="hihat-pedal-drum drum-kit"
				lastPress={hihatPedalDate}
			/>
			<OverlayComponent className="hihat-drum drum-kit" lastPress={hihatDate} />
			<OverlayComponent className="ride-drum drum-kit" lastPress={rideDate} />
			<OverlayComponent className="snare-drum drum-kit" lastPress={snareDate} />
			<OverlayComponent className="tom1-drum drum-kit" lastPress={tom1Date} />
			<OverlayComponent className="tom2-drum drum-kit" lastPress={tom2Date} />
			<OverlayComponent className="tom3-drum drum-kit" lastPress={tom3Date} />
			<OverlayComponent className="tom4-drum drum-kit" lastPress={tom4Date} />
		</>
	);
}
