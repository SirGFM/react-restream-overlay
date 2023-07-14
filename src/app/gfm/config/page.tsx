'use client';

import './config.css';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import CategoryManager, { CategoryList } from './CategoryManager';
import req from '@/utils/req';

interface StartRun {
	/** The run's unique token. */
	Token: string;
}

export default function Config() {
	/** The title loaded from the server, if any. */
	const [defaultTitle, setDefaultTitle] = useState('');
	/** The width loaded from the server, if any. */
	const [defaultWidth, setDefaultWidth] = useState(0);
	/** The height loaded from the server, if any. */
	const [defaultHeight, setDefaultHeight] = useState(0);
	/** The config refresh rate loaded from the server, if any. */
	const [defaultConfigRefreshRate, setDefaultConfigRefreshRate] =
		useState(2500);
	/** The timer refresh rate loaded from the server, if any. */
	const [defaultTimerRefreshRate, setDefaultTimerRefreshRate] = useState(117);
	/** The run token loaded from the server, if any. */
	const [runToken, setRunToken] = useState('');
	/** Value used to forcefully reload the list of categories. */
	const [reloadList, setReloadList] = useState(0);
	/** The list of categories. */
	const category = useRef<HTMLSelectElement | null>(null);
	/** Reference to the title, so it may be set from the active run. */
	const title = useRef<HTMLInputElement | null>(null);

	/** The runs and storage endpoints,
	 * either from a default value or from the 'post_url' and 'run_url' query string,
	 * respectively. */
	const queryString = useSearchParams();
	const queryConfigUrl = queryString.get('post_url') ?? '/ram_store/config';
	const queryRunUrl = queryString.get('run_url') ?? '/run';

	/**
	 * newRun starts a new run and configures it for the overlay.
	 */
	function newRun() {
		/* Get the category name from the select ref. */
		if (!category.current) {
			console.error('no category selection available');
			return;
		} else if (category.current.selectedOptions.length != 1) {
			console.error('got multiple categories');
			return;
		}

		const name = category.current.selectedOptions[0].value;

		/* Start the new run, updating the title accordingly. */
		req(`${queryRunUrl}/new/${name}`, undefined, (data: any) => {
			const res = data as StartRun;

			setRunToken(res.Token);
			setDefaultTitle('');
			if (title.current) {
				title.current.value = name;
			}
		});
	}

	/**
	 * deleteRun removes the active run from the layout.
	 */
	const deleteRun = useCallback(() => {
		setRunToken('');
		setDefaultTitle('');
		if (title.current) {
			title.current.value = '';
		}
	}, [setRunToken]);

	/**
	 * reloadCategories forces the reload of the categories list.
	 */
	const reloadCategories = useCallback(() => {
		setReloadList((old) => old + 1);
	}, [setReloadList]);

	/* Load the values currently configured in the server. */
	useEffect(() => {
		let abort = false;

		const options = {
			cache: 'no-store' as const,
		};

		fetch(queryConfigUrl, options).then((res) => {
			if (!res.ok) {
				console.error(res.statusText);
				return;
			} else if (abort) {
				console.log('aborting...');
				return;
			}

			res.formData().then((data) => {
				if (abort) {
					console.log('aborting...');
					return;
				}

				const _title = data.get('title');
				const _width = data.get('width');
				const _height = data.get('height');
				const _runToken = data.get('run-token');
				const _configRefresh = data.get('config-refresh');
				const _timerRefresh = data.get('timer-refresh');

				if (_title) {
					setDefaultTitle(_title + '');
				}
				if (_width) {
					setDefaultWidth(parseInt(_width + ''));
				}
				if (_height) {
					setDefaultHeight(parseInt(_height + ''));
				}
				if (_runToken) {
					setRunToken(_runToken + '');
				}
				if (_configRefresh) {
					setDefaultConfigRefreshRate(parseInt(_configRefresh + ''));
				}
				if (_timerRefresh) {
					setDefaultTimerRefreshRate(parseInt(_timerRefresh + ''));
				}
			});
		});

		return () => {
			abort = true;
		};
	}, [queryConfigUrl, setDefaultTitle, setDefaultWidth, setDefaultHeight]);

	return (
		<>
			<h1> Config </h1>

			<h2> Configure Run </h2>

			<iframe name="prevent-submission" style={{ display: 'none' }}></iframe>
			<form target="prevent-submission">
				<div className="fill-line">
					<input type="button" value="Reload list" onClick={reloadCategories} />
				</div>

				<div>
					<label htmlFor="run-enabled"> Run enabled? </label>
					<input
						type="checkbox"
						name="run-enabled"
						checked={!!runToken}
						disabled
					/>
				</div>

				<CategoryList ref={category} forceUpdate={reloadList} />

				<div className="fill-line">
					<input type="button" value="Setup Run" onClick={newRun} />

					<input type="button" value="Remove Run" onClick={deleteRun} />
				</div>
			</form>

			<h2> Configure Stream </h2>

			<form action={queryConfigUrl} encType="multipart/form-data" method="POST">
				<div>
					<label htmlFor="title"> Title: </label>
					<input
						type="text"
						id="title"
						name="title"
						key="title"
						defaultValue={defaultTitle}
						required
						ref={title}
						readOnly={!!runToken}
					/>
				</div>

				<div>
					<label htmlFor="width"> Width: </label>
					<input
						type="number"
						id="width"
						name="width"
						key="width"
						defaultValue={defaultWidth}
						required
					/>
				</div>

				<div>
					<label htmlFor="height"> Height: </label>
					<input
						type="number"
						id="height"
						name="height"
						key="height"
						defaultValue={defaultHeight}
						required
					/>
				</div>

				<div>
					<label htmlFor="config-refresh"> Config Update (ms): </label>
					<input
						type="number"
						id="config-refresh"
						name="config-refresh"
						key="config-refresh"
						defaultValue={defaultConfigRefreshRate}
					/>
				</div>

				<div>
					<label htmlFor="timer-refresh"> Timer Update (ms): </label>
					<input
						type="number"
						id="timer-refresh"
						name="timer-refresh"
						key="timer-refresh"
						defaultValue={defaultTimerRefreshRate}
					/>
				</div>

				<input
					className="hidden"
					type="text"
					id="run-token"
					name="run-token"
					key="run-token"
					defaultValue={runToken}
				/>

				<div>
					<input type="submit" value="Update" />
				</div>
			</form>

			<CategoryManager />
		</>
	);
}
