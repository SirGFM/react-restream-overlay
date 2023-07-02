'use client';

import {
	Dispatch,
	SetStateAction,
	useRef,
	useEffect,
	useCallback,
} from 'react';
import OBSWebSocket, { OBSResponseTypes } from 'obs-websocket-js';

/**
 * sleep halts the async context for a while.
 *
 * @param {number} ms - For how long the context should be stopped.
 */
async function sleep(ms: number): Promise<void> {
	return new Promise<void>((resolve) => {
		setTimeout(() => resolve(), ms);
	});
}

/**
 * parseBool tries to coerce (some) bool-ish values.
 *
 * @param {any} value - A bool-ish value.
 * @return {boolean} - Whether the value is true or false.
 */
function parseBool(value: any): boolean {
	/* Ensure that JS doesn't wrongly coerce the boolean. */
	if (typeof value === 'string' && value.toLowerCase() == 'false') {
		return false;
	}

	return !!value;
}

/* percentageToDB converts the percentage to a value in dB.
 *
 * This is confusing, but bear with me...
 *
 * When the volume at 100%, it should result in a 0dB gain,
 * and at 0% it should result in a -100dB gain.
 * However, the gain decrease is exponential.
 *
 * Since it's easier to understand the relationships in an increasing progression,
 * assuming that the gain grows (instead of decreasing) exponentially,
 * the factor would increase as:
 *
 *   - 0% -> 0
 *   - 25% -> 1
 *   - 50% -> 2
 *   - 75% -> 4
 *   - 100% -> 8
 *
 * Which can be approximated by the exponential f(x) = 2 ^ x - 1:
 *
 *   - f(0) -> 0
 *   - f(1) -> 1
 *   - f(2) -> 3
 *   - f(3) -> 7
 *   - f(4) -> 15
 *
 * NOTE: Although this ends up doubling the factor,
 * in practice it still works out just fine.
 *
 * The percentage can be easily converted to a value in the range [0, 4]
 * by dividing it by 25 (or multiplying the percentage in the [0.0, 1.0] range by 4).
 *
 * Lastly, since the volume decreases from 0 to -100,
 * the percentage must be inverted (i.e., 0% == 1.0 and 100% = 0.0).
 * This can be easily achieved by simply subtracting the percentage from 1.0,
 * hence why the previous sections assumed an increasing exponential.
 *
 * Thus, the factor can be approximated by the equation,
 * assuming x in the [0.0, 1.0] range:
 *
 *     f(x) = 2 ^ ((1.0 - x) * 4.0) - 1
 *
 * This was tested empirically,
 * and -6.75 yielded nice results for the position of the slider in OBS.
 * It causes the values to become:
 *
 *   - 100% -> 0
 *   - 75% -> -6.75
 *   - 50% -> -20.25
 *   - 25% -> -47.25
 *   - 0% -> -101.25
 *
 * Since OBS doesn't accept gains lower than -100dB,
 * the final value is clamped to that.
 *
 * @param {number} v - The percentage in the [0.0, 1.0] range.
 * @return {number} - The equivalent gain, in dB.
 */
function percentageToDB(v: number): number {
	v = (Math.pow(2, (1.0 - v) * 4.0) - 1) * -6.75;
	if (v < -100.0) {
		v = -100.0;
	}

	return v;
}

/** Transition defines a scene transition. */
export interface Transition {
	/** The name of the scene being transitioned to. */
	scene: string;
	/** The name of the transition effect.
	 * If not set, defaults to 'Cut'. */
	effect?: string;
	/** How long should the effect take.
	 * If not set, defaults to immediately. */
	delayMs?: number;
}

export interface Volume {
	/** Name of the audio device. */
	name: string;
	/** Volume of the audio device, in the [0.0, 1.0] range.
	 * If outside the range, the value will be clamped! */
	volume: number;
	/** Whether the source should be muted. */
	mute?: boolean;
}

type setState<T> = Dispatch<SetStateAction<T | undefined>>;

/** OBSLocalControllerProps configures a OBSLocalController. */
export interface OBSLocalControllerProps {
	/** Enable debug logging to the console. */
	debug?: boolean;
	/** The address of the OBS WebSocket server.
	 * If not set, default to 'localhost'. */
	address?: string;
	/** The port of the OBS WebSocket server.
	 * If not set, default to 4455. */
	port?: number;
	/** The password of the OBS WebSocket server, if required. */
	password?: string;
	/** Scene which should be loaded in Studio mode's preview. */
	previewScene?: string;
	/** Setter for resetting the previewScene state variable. */
	setPreviewScene: setState<string>;
	/** Scene transition that should take effect in Studio mode. */
	transition?: Transition;
	/** Setter for resetting the transition state variable. */
	setTransition: setState<Transition>;
	/** Update the volume of audio devices. */
	volumes?: Volume[];
	/** Setter for resetting the volumes state variable. */
	setVolumes: setState<Volume[]>;
}

export default function OBSLocalController(props: OBSLocalControllerProps) {
	/** Reference to the initialized OBS connection. */
	const obs = useRef<OBSWebSocket | null>(null);
	const {
		debug,
		address,
		port,
		password,
		previewScene,
		setPreviewScene,
		transition,
		setTransition,
		volumes,
		setVolumes,
	} = props;

	/** debugLog logs messages only if props.debug is set. */
	const debugLog = useCallback(
		(msg: string) => {
			if (debug) {
				console.log('OBSLocalController: ' + msg);
			}
		},
		[debug]
	);

	/* Start a connection to OBS's WebSocket server.
	 * On success, a callback is configured to reconnect on any error. */
	useEffect(() => {
		let running = true;

		async function connect() {
			let _obs = new OBSWebSocket();

			const url = 'ws://' + (address ?? 'localhost') + ':' + (port ?? '4455');

			/* Continuously retry connecting to the server,
			 * until either the effect succeeds
			 * or the component is unmounted. */
			while (running) {
				try {
					debugLog(`trying to connect to '${url}'...`);
					await _obs.connect(url, password);
					break;
				} catch (e: any) {
					debugLog(`connection failed: ${e}`);
					await _obs.disconnect();
				}

				await sleep(250);
			}
			_obs.once('ConnectionClosed', (e: any) => setTimeout(connect, 500));

			if (!running) {
				debugLog('component was unmounted after connection!');
				_obs.disconnect();
				return;
			}

			debugLog('connected!');
			obs.current = _obs;
		}

		connect();
		return () => {
			debugLog('disconnecting...');
			running = false;

			obs.current?.disconnect();
			obs.current = null;
		};
	}, [address, port, password, debugLog]);

	/* Change the preview scene, when requested. */
	useEffect(() => {
		let running = true;

		/* Ignore if the state variable was reset. */
		if (!previewScene) {
			return;
		}
		const value: string = previewScene;

		/** setPreview actually attempts to set the preview scene. */
		async function setPreview() {
			await obs.current?.callBatch([
				{
					requestType: 'SetStudioModeEnabled',
					requestData: { studioModeEnabled: true },
				},
				{
					requestType: 'SetCurrentPreviewScene',
					requestData: { sceneName: value },
				},
			]);
		}

		async function setScene() {
			/* Wait until the connection is established. */
			while (!obs.current) {
				if (!running) {
					return;
				}

				debugLog('waiting OBS connection before changing the preview scene...');
				await sleep(250);
			}

			/* Try to change the scene, checking if the scene did actually change. */
			let retries = 5;
			while (retries > 0) {
				await setPreview();

				await sleep(250);
				const { currentPreviewSceneName: changedScene } =
					await obs.current?.call('GetCurrentPreviewScene');
				if (changedScene != value) {
					debugLog('failed to set the preview scene, retrying...');
					retries--;
				} else {
					debugLog('preview scene set successfully!');
					break;
				}
			}
			if (retries <= 0) {
				throw 'failed to set the preview scene';
			}

			/* Finally, reset the state variable. */
			setPreviewScene(undefined);
		}

		setScene();
		return () => {
			running = false;
		};
	}, [previewScene, setPreviewScene, debugLog]);

	useEffect(() => {
		let running = true;

		/* Ignore if the state variable was reset. */
		if (!transition) {
			return;
		}
		const value: Transition = transition;

		/* Even though delayMs should be a number for TS,
		 * JS can be dumb and forward anything here... */
		const delayStr: string = transition.delayMs
			? '' + transition.delayMs
			: '50';
		const delay = parseInt(delayStr);

		/** sceneTransition actually attempts the scene transaction. */
		async function sceneTransition() {
			return obs.current?.callBatch([
				{
					requestType: 'SetStudioModeEnabled',
					requestData: { studioModeEnabled: true },
				},
				{
					requestType: 'SetCurrentPreviewScene',
					requestData: { sceneName: value.scene },
				},
				{
					requestType: 'SetCurrentSceneTransition',
					requestData: { transitionName: value.effect ?? 'Cut' },
				},
				{
					requestType: 'SetCurrentSceneTransitionDuration',
					requestData: { transitionDuration: delay },
				},
				{
					/* XXX: The transition won't work without this delay... */
					requestType: 'Sleep',
					requestData: { sleepMillis: 100 },
				},
				{
					requestType: 'TriggerStudioModeTransition',
				},
			]);
		}

		async function changeScene() {
			/* Wait until the connection is established. */
			while (!obs.current) {
				if (!running) {
					return;
				}

				debugLog('waiting OBS connection before changing scenes...');
				await sleep(250);
			}

			/* Do nothing if the scene is already the active one. */
			const { currentProgramSceneName: currentScene } = await obs.current?.call(
				'GetCurrentProgramScene'
			);
			if (!obs.current || currentScene == value.scene) {
				return;
			}

			/* Try to change the scene, checking if the scene did actually change. */
			let retries = 10;
			while (retries > 0) {
				await sceneTransition();

				await sleep(250);
				const { currentProgramSceneName: changedScene } =
					await obs.current?.call('GetCurrentProgramScene');
				if (changedScene != value.scene) {
					debugLog('failed to change the scene, retrying...');
					retries--;
				} else {
					debugLog('scene changed successfully!');
					break;
				}
			}
			if (retries <= 0) {
				throw 'failed to change scene';
			}

			/* Finally, reset the state variable. */
			setTransition(undefined);
		}

		changeScene();
		return () => {
			running = false;
		};
	}, [transition, setTransition, debugLog]);

	/* Change the preview scene, when requested. */
	useEffect(() => {
		let running = true;

		/* Ignore if the state variable was reset. */
		if (!volumes || volumes.length == 0) {
			return;
		}

		/* Calculate each volume in dB (ish). */
		const values = volumes.flatMap(({ name, volume, mute }) => {
			let v = parseFloat(volume + '');

			/* Clamp the value to the [0.0, 1.0] range. */
			if (isNaN(v) || v < 0.0) {
				v = 0.0;
			} else if (v > 1.0) {
				v = 1.0;
			}

			v = percentageToDB(v);

			let ret = [];
			if (mute !== undefined) {
				ret.push({
					requestType: 'SetInputMute' as const,
					requestData: {
						inputName: name,
						inputMuted: parseBool(mute),
					},
					_expected: parseBool(mute),
				});
			}

			ret.push({
				requestType: 'SetInputVolume' as const,
				requestData: {
					inputName: name,
					inputVolumeDb: v,
				},
				_expected: v,
			});

			return ret;
		});

		/* Batch for retrieving the changes. */
		const checkValues = values.map((req) => {
			/* Rename the 'Set' operation to a 'Get'. */
			const requestType =
				req.requestType == 'SetInputVolume'
					? ('GetInputVolume' as const)
					: ('GetInputMute' as const);

			return {
				requestType: requestType,
				requestData: {
					inputName: req.requestData.inputName,
				},
				_expected: req._expected,
			};
		});

		async function setOBSVolumes() {
			/* Wait until the connection is established. */
			while (!obs.current) {
				if (!running) {
					return;
				}

				debugLog('waiting OBS connection before updating the volumes...');
				await sleep(250);
			}

			/* Try to set the volume, checking if the volume did actually change. */
			let retries = 5;
			while (retries > 0) {
				await obs.current?.callBatch(values);

				await sleep(250);
				const resp = await obs.current?.callBatch(checkValues);
				if (resp.length != checkValues.length) {
					debugLog('failed to retrieve the volumes, retrying...');
					retries--;
					continue;
				}

				let ok = true;
				for (let idx in resp) {
					if (resp[idx].requestType == 'GetInputVolume') {
						const respVolume = resp[idx]
							?.responseData as OBSResponseTypes['GetInputVolume'];

						/* Convert the value to an integer,
						 * to ensure equality even if the floats are slightly different. */
						const want = parseInt('' + checkValues[idx]._expected);
						const got = respVolume
							? parseInt('' + respVolume.inputVolumeDb)
							: undefined;

						ok &&= respVolume && got == want;
					} else {
						const respMuted = resp[idx]
							?.responseData as OBSResponseTypes['GetInputMute'];
						ok &&=
							respMuted && respMuted.inputMuted == checkValues[idx]._expected;
					}
				}
				if (!ok) {
					debugLog('failed to set the volumes, retrying...');
					retries--;
				} else {
					debugLog('volume updated successfully!');
					break;
				}
			}
			if (retries <= 0) {
				throw 'failed to set the volumes';
			}

			/* Finally, reset the state variable. */
			setVolumes(undefined);
		}

		setOBSVolumes();
		return () => {
			running = false;
		};
	}, [volumes, setVolumes, debugLog]);

	return <></>;
}
