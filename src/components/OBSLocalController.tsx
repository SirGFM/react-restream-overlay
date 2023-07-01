'use client';

import {
	Dispatch,
	SetStateAction,
	useRef,
	useEffect,
	useCallback,
} from 'react';
import OBSWebSocket from 'obs-websocket-js';

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
	}, [address, port, password]);

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
	}, [previewScene, setPreviewScene]);

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
	}, [transition, setTransition]);

	return <></>;
}
