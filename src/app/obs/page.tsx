'use client';

import { useCallback, useState } from 'react';
import OBSLocalController, {
	Transition,
	Volume,
} from '@/components/OBSLocalController';
import { useSearchParams } from 'next/navigation';

function getInt(value: string | null | undefined): number | undefined {
	if (!value) {
		return undefined;
	}

	/* Parse the number, converting NaN to undefined. */
	const int = parseInt(value);
	return int ? int : undefined;
}

export default function OBS() {
	const [inputScene, setInputScene] = useState<string | undefined>(undefined);
	const [inputTransition, setInputTransition] = useState<string | undefined>(
		undefined
	);
	const [inputDelayMs, setInputDelayMs] = useState<number | undefined>(
		undefined
	);
	const [inputVolumeName, setInputVolumeName] = useState<string | undefined>(
		undefined
	);
	const [inputVolume, setInputVolume] = useState<number>(0);
	const [inputMuted, setInputMuted] = useState<boolean>(false);
	const [previewScene, setPreviewScene] = useState<string | undefined>(
		undefined
	);
	const [transition, setTransition] = useState<Transition | undefined>(
		undefined
	);
	const [volumes, setVolumes] = useState<Volume[] | undefined>(undefined);

	const searchParams = useSearchParams();
	const addr = searchParams.get('addr') ?? undefined;
	const port = getInt(searchParams.get('port'));
	const pwd = searchParams.get('pwd') ?? undefined;
	const debug = !!(searchParams.get('debug') ?? false);

	const onChangeScene = useCallback(
		(e: any) => setInputScene(e.target.value),
		[setInputScene]
	);
	const onChangeTransition = useCallback(
		(e: any) => setInputTransition(e.target.value),
		[setInputTransition]
	);
	const onChangeDelayMs = useCallback(
		(e: any) => setInputDelayMs(e.target.value),
		[setInputDelayMs]
	);
	const onChangeVolumeName = useCallback(
		(e: any) => setInputVolumeName(e.target.value),
		[setInputVolumeName]
	);
	const onChangeVolume = useCallback(
		(e: any) => setInputVolume(e.target.value),
		[setInputVolume]
	);
	const onChangeMuted = useCallback(
		(e: any) => setInputMuted(e.target.checked),
		[setInputMuted]
	);

	function updatePreview(e: any) {
		setPreviewScene(inputScene);
	}

	function updateScene(e: any) {
		if (!inputScene) {
			throw 'scene is required!';
		}

		setTransition({
			scene: inputScene,
			effect: inputTransition,
			delayMs: inputDelayMs,
		});
	}

	function updateVolume(e: any) {
		if (!inputVolumeName) {
			throw 'volume name is required!';
		}

		setVolumes([
			{
				name: inputVolumeName,
				volume: inputVolume / 100.0,
				mute: inputMuted,
			},
		]);
	}

	return (
		<div style={{ backgroundColor: 'white', color: 'black' }}>
			<OBSLocalController
				debug={debug}
				address={addr}
				port={port}
				password={pwd}
				previewScene={previewScene}
				setPreviewScene={setPreviewScene}
				transition={transition}
				setTransition={setTransition}
				volumes={volumes}
				setVolumes={setVolumes}
			/>

			<div>
				<label htmlFor="set-scene"> Scene: </label>
				<input
					type="text"
					id="set-scene"
					name="set-scene"
					value={inputScene ?? ''}
					onChange={onChangeScene}
				/>
			</div>

			<div>
				<label htmlFor="set-transition"> Transition: </label>
				<input
					type="text"
					id="set-transition"
					name="set-transition"
					value={inputTransition ?? ''}
					onChange={onChangeTransition}
				/>
			</div>

			<div>
				<label htmlFor="set-delay"> Delay: </label>
				<input
					type="number"
					id="set-delay"
					name="set-delay"
					value={inputDelayMs ?? ''}
					onChange={onChangeDelayMs}
				/>
			</div>

			<div>
				<input type="button" value="Set preview" onClick={updatePreview} />
			</div>
			<div>
				<input type="button" value="Change scene" onClick={updateScene} />
			</div>

			<hr />

			<div>
				<label htmlFor="set-volume-name"> Audio Device: </label>
				<input
					type="text"
					id="set-volume-name"
					name="set-volume-name"
					value={inputVolumeName ?? ''}
					onChange={onChangeVolumeName}
				/>
			</div>
			<div>
				<label htmlFor="set-volume"> Volume: </label>
				<input
					type="range"
					id="set-volume"
					name="set-volume"
					min={0}
					max={100}
					value={inputVolume}
					onChange={onChangeVolume}
				/>
				<label htmlFor="set-volume"> ({inputVolume}%) </label>
			</div>
			<div>
				<label htmlFor="set-muted"> Mute: </label>
				<input
					type="checkbox"
					id="set-muted"
					name="set-muted"
					checked={inputMuted}
					onChange={onChangeMuted}
				/>
			</div>
			<div>
				<input type="button" value="Update volume" onClick={updateVolume} />
			</div>
		</div>
	);
}
