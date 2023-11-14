'use client';

import './drum-overlay.css';

import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import atoi from '@/utils/atoi';
import req from '@/utils/req';
import { useDrumConfig } from './DrumConfig';
import ActionIcon from './ActionIcon';
import { useKeyConfig } from './KeyConfig';
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

	/** Retrieve the setters/getters for the keys. */
	const {
		keysSetter: keyStateSetter,
		attack,
		skill,
		spell,
		jump,
		swap,
		pause,
		up,
		down,
		left,
		right,
	} = useKeyConfig();

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

			/* Update which keys are pressed. */
			if (msg.keys) {
				Object.entries(msg.keys).forEach(([key, state]) => {
					const setter = keyStateSetter[key];
					if (!setter) {
						console.error(`missing setter for key ${key}`);
						return;
					}
					setter(state);
				});
			}
		});
	}, [drumUrl, dateSetter, keysSetter, keyStateSetter]);

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
			<ActionIcon x={168} y={208} keys={bassKeys} />

			<OverlayComponent
				className="crash1-drum drum-kit"
				lastPress={crash1Date}
			/>
			<ActionIcon x={112} y={16} keys={crash1Keys} />

			<OverlayComponent
				className="crash2-drum drum-kit"
				lastPress={crash2Date}
			/>
			<ActionIcon x={358} y={184} keys={crash2Keys} />

			<OverlayComponent
				className="hihat-pedal-drum drum-kit"
				lastPress={hihatPedalDate}
			/>
			<ActionIcon x={8} y={240} keys={hihatPedalKeys} />

			<OverlayComponent className="hihat-drum drum-kit" lastPress={hihatDate} />
			<ActionIcon x={40} y={109} keys={hihatKeys} />

			<OverlayComponent className="ride-drum drum-kit" lastPress={rideDate} />
			<ActionIcon x={304} y={56} keys={rideKeys} />

			<OverlayComponent className="snare-drum drum-kit" lastPress={snareDate} />
			<ActionIcon x={56} y={192} keys={snareKeys} />

			<OverlayComponent className="tom1-drum drum-kit" lastPress={tom1Date} />
			<ActionIcon x={128} y={104} keys={tom1Keys} />

			<OverlayComponent className="tom2-drum drum-kit" lastPress={tom2Date} />
			<ActionIcon x={208} y={104} keys={tom2Keys} />

			<OverlayComponent className="tom3-drum drum-kit" lastPress={tom3Date} />
			<ActionIcon x={272} y={152} keys={tom3Keys} />

			<OverlayComponent className="tom4-drum drum-kit" lastPress={tom4Date} />
			<ActionIcon x={280} y={232} keys={tom4Keys} />

			<div className="keys base-key">
				{attack ? <div className="attack-key base-key" /> : null}
				<ActionIcon x={0} y={0} keys="ATTACK" />

				{skill ? <div className="skill-key base-key" /> : null}
				<ActionIcon x={66} y={0} keys="SKILL" />

				{spell ? <div className="spell-key base-key" /> : null}
				<ActionIcon x={132} y={0} keys="SPELL" />

				{jump ? <div className="jump-key base-key" /> : null}
				<ActionIcon x={0} y={66} keys="JUMP" />

				{swap ? <div className="swap-key base-key" /> : null}
				<ActionIcon x={66} y={66} keys="SWAP" />

				{pause ? <div className="pause-key base-key" /> : null}
				<ActionIcon x={132} y={66} keys="PAUSE" />

				{up ? <div className="up-key base-key" /> : null}
				<ActionIcon x={66} y={146} keys="UP" />

				{down ? <div className="down-key base-key" /> : null}
				<ActionIcon x={66} y={212} keys="DOWN" />

				{left ? <div className="left-key base-key" /> : null}
				<ActionIcon x={0} y={212} keys="LEFT" />

				{right ? <div className="right-key base-key" /> : null}
				<ActionIcon x={132} y={212} keys="RIGHT" />
			</div>
		</>
	);
}
