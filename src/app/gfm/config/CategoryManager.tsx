'use client';

import './config.css';

import { useSearchParams } from 'next/navigation';
import {
	forwardRef,
	ForwardedRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import req from '@/utils/req';

interface SplitList {
	/** The list of splits retrieved from the server. */
	Splits: string[];
}

interface CategoryListProps {
	/* A value used to forcefully update the category list.
	 * Just be sure to set it to something new every time. */
	forceUpdate?: number;
}

export const CategoryList = forwardRef(
	(props: CategoryListProps, ref: ForwardedRef<HTMLSelectElement | null>) => {
		/** List of categories, loaded from the server. */
		const [categories, setCategories] = useState<string[]>([]);

		/** The splits endpoint,
		 * either from a default value or from the 'splits_url' query string. */
		const queryString = useSearchParams();
		const querySplitsUrl = queryString.get('splits_url') ?? '/splits';

		const { forceUpdate } = props;

		/* Load the list of available categories in the server. */
		useEffect(() => {
			let abort = false;

			req(`${querySplitsUrl}/list`, undefined, (data: any) => {
				if (abort) {
					console.log('aborting...');
					return;
				}

				const res = data as SplitList;

				setCategories(res.Splits);
			});

			return () => {
				abort = true;
			};
		}, [querySplitsUrl, setCategories, forceUpdate]);

		return (
			<div>
				<label htmlFor="categories"> Select a Category: </label>
				<select
					ref={ref}
					name="categories"
					id="categories"
					disabled={categories.length == 0}
				>
					{categories.length == 0 ? (
						<option value=""> -- Empty -- </option>
					) : null}
					{categories.map((category) => (
						<option key={category} value={category}>
							{category}
						</option>
					))}
				</select>
			</div>
		);
	}
);
CategoryList.displayName = 'CategoryList';

interface Split {
	/** The name of the Category. */
	Name: string;
	/** The segments within this category. */
	Entries: string[];
}

export default function CategoryManager() {
	/** Force updating the category list. */
	const [updateCategories, setUpdateCategories] = useState<number>(0);
	/** Name of the category loaded from the server, if any. */
	const [defaultTitle, setDefaultTitle] = useState('');
	/** List of segment keys. */
	const [segments, setSegments] = useState<string[]>([]);
	/** Name of the segments, as loaded from the server (if at all). */
	const [loadedSegmentNames, setLoadedSegmentNames] = useState<{
		[key: string]: string;
	}>({});
	/** Counter used to generate unique keys for sequential segments.
	 * This is increased and used as a segment's key,
	 * when the main 'add segment' button is pressed. */
	const segmentKey = useRef<number>(0);
	/** Counter used to generate unique keys intermediate segments.
	 * This is decreased and appended to a segment's key when the '+' button is pressed,
	 * creating a new segment that keeps the order of the previous ones. */
	const midSegmentKey = useRef<number>(0x7fffffff);
	/** Select DOM with the category to be loaded (if any). */
	const selectedCategory = useRef<HTMLSelectElement | null>(null);
	/** Form DOM with the new/edited category name and segments. */
	const form = useRef<HTMLFormElement | null>(null);

	/** The splits endpoint,
	 * either from a default value or from the 'splits_url' query string. */
	const queryString = useSearchParams();
	const querySplitsUrl = queryString.get('splits_url') ?? '/splits';

	/**
	 * resetKeys resets the key counters back to their starting value.
	 */
	const resetKeys = useCallback(() => {
		segmentKey.current = 0;
		midSegmentKey.current = 0x7fffffff;
	}, []);

	/**
	 * onLoad loads the category selected in the dropdown.
	 */
	const onLoad = useCallback(() => {
		/* Get the category name from the select ref. */
		if (!selectedCategory.current) {
			console.error('no category selection available');
			return;
		} else if (selectedCategory.current.selectedOptions.length != 1) {
			console.error('got multiple categories');
			return;
		}

		const name = selectedCategory.current.selectedOptions[0].value;

		req(`${querySplitsUrl}/load/${name}`, undefined, (data: any) => {
			const res = data as Split;

			setDefaultTitle(res.Name);
			resetKeys();

			/* Create keys for each segment,
			 * and add then to the pre-filled list (loadedSegmentNames state var). */
			let loadedSegments = [];
			let segmentNames: { [key: string]: string } = {};
			for (let entry of res.Entries) {
				const key = `${segmentKey.current}`;
				segmentKey.current++;

				loadedSegments.push(key);
				segmentNames[key] = entry;
			}

			setSegments(loadedSegments);
			setLoadedSegmentNames(segmentNames);
		});
	}, [querySplitsUrl, setDefaultTitle, resetKeys]);

	/**
	 * onDelete deletes the category selected in the dropdown.
	 */
	const onDelete = useCallback(() => {
		/* Get the category name from the select ref. */
		if (!selectedCategory.current) {
			console.error('no category selection available');
			return;
		} else if (selectedCategory.current.selectedOptions.length != 1) {
			console.error('got multiple categories');
			return;
		}

		const name = selectedCategory.current.selectedOptions[0].value;

		/* On Success, simply remove the category from the list. */
		req(`${querySplitsUrl}/${name}`, { method: 'DELETE' as const }, () => {
			setUpdateCategories((old) => old + 1);
		});
	}, [querySplitsUrl]);

	/**
	 * onAddSegment adds a new segment at the end of the list.
	 */
	const onAddSegment = useCallback(() => {
		setSegments((old) => old.concat([`${segmentKey.current}`]));
		segmentKey.current += 1;
	}, [setSegments]);

	/**
	 * onAddBellowSegment adds a new intermediate segment bellow the selected one.
	 *
	 * @param {string} key - The key of the selected segment.
	 */
	const onAddBellowSegment = useCallback(
		(key: string) => {
			setSegments((old) => {
				let arr = [];

				/* Create a copy of the current segments,
				 * adding the new one in a lexicographically greater value than the selected segment,
				 * but in a value lexicographically smaller than the following segment.
				 * Since the values are generated by decreasing a counter from MAX INT,
				 * subsequent additions on the same position will come exactly after the clicked segment.
				 */
				for (let entries of old) {
					arr.push(entries);
					if (entries == key) {
						arr.push(`${entries}.${midSegmentKey.current}`);
					}
				}

				return arr;
			});

			midSegmentKey.current -= 1;
		},
		[setSegments]
	);

	/**
	 * onRemoveSegment removes the selected segment
	 *
	 * @param {string} key - The key of the selected segment.
	 */
	const onRemoveSegment = useCallback(
		(key: string) => {
			setSegments((old) => old.filter((num) => key != num));
		},
		[setSegments]
	);

	/**
	 * onResetSegment removes every segment from the page.
	 */
	const onResetSegment = useCallback(() => {
		setSegments([]);
		setLoadedSegmentNames({});
		resetKeys();
	}, [setLoadedSegmentNames, setSegments, resetKeys]);

	/**
	 * onSave saves the category to the server.
	 */
	const onSave = useCallback(() => {
		if (form.current == null) {
			console.error('no form available');
			return;
		} else if (!form.current.checkValidity()) {
			form.current.reportValidity();
			return;
		}

		/* Extract the title and segments from the form. */
		let title = '';
		let unsortedSegments: { [key: string]: string } = {};

		const inputs = form.current.getElementsByTagName('input');
		for (let idx = 0; idx < inputs.length; idx++) {
			const el = inputs[idx];

			if (el.name == 'title') {
				title = el.value;
			} else if (el.name && el.name.startsWith('segment-')) {
				unsortedSegments[el.name] = el.value;
			}
		}

		/* Convert the segments to an array sorted on their keys. */
		const segments = Object.entries(unsortedSegments)
			.sort((a, b) => {
				if (a[0] > b[0]) {
					return 1;
				} else if (a[0] < b[0]) {
					return -1;
				}
				return 0;
			})
			.map(([_, value]) => value);

		if (segments.length == 0) {
			console.error('at least one segment must be speficied!');
			return;
		}

		const payload = JSON.stringify({
			Name: title,
			Entries: segments,
		});

		/* Check if the category should be created or updated. */
		let method: 'POST' | 'PUT' = 'POST' as const;
		if (selectedCategory.current) {
			for (let idx = 0; idx < selectedCategory.current.options.length; idx++) {
				const opt = selectedCategory.current.options[idx];

				if (opt.value == title) {
					method = 'PUT' as const;
					break;
				}
			}
		}

		req(`${querySplitsUrl}`, { method: method, body: payload }, () => {
			resetKeys();
			onResetSegment();
			setDefaultTitle('');

			if (method == 'POST') {
				setUpdateCategories((old) => old + 1);
			}
		});
	}, [resetKeys, querySplitsUrl, onResetSegment, setDefaultTitle]);

	return (
		<>
			<h1> Category Manager </h1>

			<h2> Categories </h2>

			<CategoryList forceUpdate={updateCategories} ref={selectedCategory} />

			<div className="fill-line">
				<input type="button" value="Load" onClick={onLoad} />
				<input type="button" value="Delete" onClick={onDelete} />
			</div>

			<h2> Edit Category </h2>

			<iframe name="prevent-submission" style={{ display: 'none' }}></iframe>
			<form ref={form} target="prevent-submission">
				<div>
					<label htmlFor="title"> Title: </label>
					<input
						type="text"
						id="title"
						name="title"
						key="title"
						defaultValue={defaultTitle}
						required
					/>
				</div>

				<div className="fill-line">
					<input
						type="button"
						value="(+) Add segment (+)"
						onClick={onAddSegment}
					/>
					<input
						type="button"
						value="Reset Segments"
						onClick={onResetSegment}
					/>
				</div>

				{segments.map((key) => (
					<div className="fill-line" key={'div-' + key}>
						<input
							className="segment"
							type="button"
							value="-"
							onClick={(e) => onRemoveSegment(key)}
						/>
						<input
							className="segment"
							type="text"
							id={'segment-' + key}
							name={'segment-' + key}
							key={'segment-' + key}
							required
							defaultValue={loadedSegmentNames[key]}
						/>
						<input
							className="segment"
							type="button"
							value="+"
							onClick={(e) => onAddBellowSegment(key)}
						/>
					</div>
				))}

				<div>
					<input
						className="submit"
						type="button"
						value="Save"
						onClick={onSave}
					/>
				</div>
			</form>
		</>
	);
}
