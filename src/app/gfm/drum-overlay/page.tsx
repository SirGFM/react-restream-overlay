'use client';

import './drum-overlay.css';

import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import atoi from '@/utils/atoi';
import req from '@/utils/req';
import { useDrumConfig } from './DrumConfig';
import OverlayComponent from './OverlayComponent';

interface Message {
	/** Mapping of MIDI events to a comma-separated list of (keyboard) keys pressed by this event. */
	map?: { [key in string]: string };
	/** Date when each MIDI event was last pressed, in a parseable format. */
	midi?: { [key in string]: string };
	/** The state for the (keyboard) keys affected by the MIDI events. */
	keys?: { [key in string]: boolean };
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
