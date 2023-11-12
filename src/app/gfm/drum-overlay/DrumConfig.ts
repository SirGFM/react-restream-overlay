import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export interface DrumConfig {
	/** Date setter for each MIDI event. */
	dateSetter: { [key in string]: Dispatch<SetStateAction<string>> };
	/** Date when the bass drum was last hit. */
	bassDate: string;
	/** Date when the left crash was last hit. */
	crash1Date: string;
	/** Date when the right crash was last hit. */
	crash2Date: string;
	/** Date when the hihat pedal was last hit. */
	hihatPedalDate: string;
	/** Date when the hihat was last hit. */
	hihatDate: string;
	/** Date when the ride cymbal was last hit. */
	rideDate: string;
	/** Date when the snare was last hit. */
	snareDate: string;
	/** Date when the tom 1 was last hit. */
	tom1Date: string;
	/** Date when the tom 2 was last hit. */
	tom2Date: string;
	/** Date when the tom 3 was last hit. */
	tom3Date: string;
	/** Date when the tom 4 was last hit. */
	tom4Date: string;
	/** (Keyboard) Keys setter for each MIDI event. */
	keysSetter: { [key in string]: Dispatch<SetStateAction<string>> };
	/** (Keyboard) Key currently being activated by the bass drum. */
	bassKeys: string;
	/** (Keyboard) Key currently being activated by the left crash. */
	crash1Keys: string;
	/** (Keyboard) Key currently being activated by the right crash. */
	crash2Keys: string;
	/** (Keyboard) Key currently being activated by the hihat pedal. */
	hihatPedalKeys: string;
	/** (Keyboard) Key currently being activated by the hihat. */
	hihatKeys: string;
	/** (Keyboard) Key currently being activated by the ride cymbal. */
	rideKeys: string;
	/** (Keyboard) Key currently being activated by the snare. */
	snareKeys: string;
	/** (Keyboard) Key currently being activated by the tome 1. */
	tom1Keys: string;
	/** (Keyboard) Key currently being activated by the tome 2. */
	tom2Keys: string;
	/** (Keyboard) Key currently being activated by the tom 3. */
	tom3Keys: string;
	/** (Keyboard) Key currently being activated by the tom 4. */
	tom4Keys: string;
}

/**
 * useDrumConfig creates state variables for every drum pad,
 * returning their setters in maps,
 * simplifying setting a state from a MIDI event.
 */
export function useDrumConfig(): DrumConfig {
	const [bassDate, setBassDate] = useState('');
	const [crash1Date, setCrash1Date] = useState('');
	const [crash2Date, setCrash2Date] = useState('');
	const [hihatPedalDate, setHihatPedalDate] = useState('');
	const [hihatDate, setHihatDate] = useState('');
	const [rideDate, setRideDate] = useState('');
	const [snareDate, setSnareDate] = useState('');
	const [tom1Date, setTom1Date] = useState('');
	const [tom2Date, setTom2Date] = useState('');
	const [tom3Date, setTom3Date] = useState('');
	const [tom4Date, setTom4Date] = useState('');

	const [bassKeys, setBassKeys] = useState('');
	const [crash1Keys, setCrash1Keys] = useState('');
	const [crash2Keys, setCrash2Keys] = useState('');
	const [hihatPedalKeys, setHihatPedalKeys] = useState('');
	const [hihatKeys, setHihatKeys] = useState('');
	const [rideKeys, setRideKeys] = useState('');
	const [snareKeys, setSnareKeys] = useState('');
	const [tom1Keys, setTom1Keys] = useState('');
	const [tom2Keys, setTom2Keys] = useState('');
	const [tom3Keys, setTom3Keys] = useState('');
	const [tom4Keys, setTom4Keys] = useState('');

	/** Load the MIDI events from the query string. */
	const queryString = useSearchParams();
	const bassEvent = queryString.get('bass_event') ?? '0x0924';
	const crash1Event = queryString.get('crash1_event') ?? '0x0931';
	const crash2Event = queryString.get('crash2_event') ?? '0x0939';
	const hihatPedalEvent = queryString.get('hihat_pedal_event') ?? '0x092c';
	const hihatEvent = queryString.get('hihat_event') ?? '0x092a'; // also 0x092e (for closed)
	const rideEvent = queryString.get('ride_event') ?? '0x0933';
	const snareEvent = queryString.get('snare_event') ?? '0x0926';
	const tom1Event = queryString.get('tom1_event') ?? '0x0930';
	const tom2Event = queryString.get('tom2_event') ?? '0x092d';
	const tom3Event = queryString.get('tom3_event') ?? '0x092b';
	const tom4Event = queryString.get('tom4_event') ?? '0x0929';

	/* Prepare the setters, mapping each event to its setter. */
	const [keysSetter, dateSetter] = useMemo(() => {
		let keysSetter = {
			[bassEvent]: setBassKeys,
			[crash1Event]: setCrash1Keys,
			[crash2Event]: setCrash2Keys,
			[hihatPedalEvent]: setHihatPedalKeys,
			[hihatEvent]: setHihatKeys,
			[rideEvent]: setRideKeys,
			[snareEvent]: setSnareKeys,
			[tom1Event]: setTom1Keys,
			[tom2Event]: setTom2Keys,
			[tom3Event]: setTom3Keys,
			[tom4Event]: setTom4Keys,
		};

		const dateSetter = {
			[bassEvent]: setBassDate,
			[crash1Event]: setCrash1Date,
			[crash2Event]: setCrash2Date,
			[hihatPedalEvent]: setHihatPedalDate,
			[hihatEvent]: setHihatDate,
			[rideEvent]: setRideDate,
			[snareEvent]: setSnareDate,
			[tom1Event]: setTom1Date,
			[tom2Event]: setTom2Date,
			[tom3Event]: setTom3Date,
			[tom4Event]: setTom4Date,
		};

		return [keysSetter, dateSetter];
	}, [
		setBassDate,
		setCrash1Date,
		setCrash2Date,
		setHihatPedalDate,
		setHihatDate,
		setRideDate,
		setSnareDate,
		setTom1Date,
		setTom2Date,
		setTom3Date,
		setTom4Date,
		setBassKeys,
		setCrash1Keys,
		setCrash2Keys,
		setHihatPedalKeys,
		setHihatKeys,
		setRideKeys,
		setSnareKeys,
		setTom1Keys,
		setTom2Keys,
		setTom3Keys,
		setTom4Keys,
		bassEvent,
		crash1Event,
		crash2Event,
		hihatPedalEvent,
		hihatEvent,
		rideEvent,
		snareEvent,
		tom1Event,
		tom2Event,
		tom3Event,
		tom4Event,
	]);

	return {
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
		keysSetter,
		dateSetter,
	};
}
