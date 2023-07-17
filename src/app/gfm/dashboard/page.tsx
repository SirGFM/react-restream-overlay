'use client';

import './dashboard.css';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import req from '@/utils/req';
import reqForm from '@/utils/reqForm';
import { Config, ConfigType } from '../config/Config';

function TimerDashboard() {
	/** The config endpoint,
	 * either from a default value or from the 'config_url' query string. */
	const queryString = useSearchParams();
	const queryTimerUrl = queryString.get('timer_url') ?? '/timer';

	const send = useCallback(
		(action: string) => {
			const options = {
				method: 'POST',
				body: JSON.stringify({
					Action: action,
				}),
			};

			req(queryTimerUrl, options);
		},
		[queryTimerUrl]
	);

	const stop = useCallback(() => {
		send('stop');
	}, [send]);

	const start = useCallback(() => {
		send('start');
	}, [send]);

	const reset = useCallback(() => {
		send('reset');
	}, [send]);

	return (
		<div className="fill-line vertical">
			<div className="fill-line">
				<input type="button" value="Stop" onClick={stop} />
				<input type="button" value="Start" onClick={start} />
			</div>
			<div className="fill-line">
				<input type="button" value="Reset" onClick={reset} />
			</div>
		</div>
	);
}

interface RunDashboardProps {
	/** The run identifier. */
	token: string;
}

function RunDashboard(props: RunDashboardProps) {
	const { token } = props;

	/** The config endpoint,
	 * either from a default value or from the 'config_url' query string. */
	const queryString = useSearchParams();
	const baseQueryRunUrl = queryString.get('run_url') ?? '/run';

	const queryRunUrl = `${baseQueryRunUrl}/${token}`;

	const send = useCallback(
		(action: string) => {
			const options = {
				method: 'POST',
			};

			req(`${queryRunUrl}/${action}`, options);
		},
		[queryRunUrl]
	);

	const start = useCallback(() => {
		send('start');
	}, [send]);

	const split = useCallback(() => {
		send('split');
	}, [send]);

	const undo = useCallback(() => {
		send('undo');
	}, [send]);

	const save = useCallback(() => {
		send('save');
	}, [send]);

	const reset = useCallback(() => {
		send('reset');
	}, [send]);

	return (
		<div className="fill-line vertical">
			<div className="fill-line">
				<input type="button" value="Start" onClick={start} />
				<input type="button" value="Split" onClick={split} />
				<input type="button" value="Undo" onClick={undo} />
			</div>
			<div className="fill-line">
				<input type="button" value="Save" onClick={save} />
				<input type="button" value="Reset" onClick={reset} />
			</div>
		</div>
	);
}

export default function Dashboard() {
	/** How often the configuration should be refreshed. */
	const [configRefreshRate, setConfigRefreshRate] = useState(2500);
	/** The token for the current category/run, if any. */
	const [runToken, setRunToken] = useState('');
	/** Whether the dashboard was disabled. */
	const [disable, setDisabled] = useState(false);

	/** The config endpoint,
	 * either from a default value or from the 'config_url' query string. */
	const queryString = useSearchParams();
	const queryConfigUrl = queryString.get('config_url') ?? '/ram_store/config';

	/**
	 * onUpdate loads the refresh rate and the run token from the server.
	 */
	const onUpdate = useCallback(() => {
		reqForm(queryConfigUrl, ConfigType, undefined, (form) => {
			const config = form as Config;

			if (config['config-refresh']) {
				setConfigRefreshRate(config['config-refresh']);
			}

			const _runToken = config['run-token'] ?? '';
			setRunToken(_runToken);

			setDisabled(!!config['hide-timer']);
		});
	}, [queryConfigUrl, setConfigRefreshRate, setRunToken]);

	/* Configure the timer on which the dashboard is updated. */
	useEffect(() => {
		const id = setInterval(onUpdate, configRefreshRate);

		return () => {
			clearInterval(id);
		};
	}, [onUpdate, configRefreshRate]);

	return (
		<>
			<h1> Dashboard </h1>

			{disable ? (
				<p>Nothing to do here...</p>
			) : runToken ? (
				<RunDashboard token={runToken} />
			) : (
				<TimerDashboard />
			)}
		</>
	);
}
