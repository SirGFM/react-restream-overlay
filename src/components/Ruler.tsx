'use client';

import { Dispatch, SetStateAction, useLayoutEffect, useRef } from 'react';

interface RulerProps {
	/** The component being measured. */
	children: React.ReactNode;
	/** Callback to set the calculated width. */
	widthSetter?: Dispatch<SetStateAction<number>>;
	/** Callback to set the calculated height. */
	heightSetter?: Dispatch<SetStateAction<number>>;
}

export default function Ruler(props: RulerProps) {
	/** Reference to the hidden div used to get the component's size. */
	const block = useRef<null | HTMLDivElement>(null);

	const { children, heightSetter, widthSetter } = props;

	useLayoutEffect(() => {
		if (!block.current) {
			console.error('text.current not set!');
			return;
		}

		if (widthSetter) {
			widthSetter(block.current.scrollWidth);
		}
		if (heightSetter) {
			heightSetter(block.current.scrollHeight);
		}
	}, [children, heightSetter, widthSetter]);

	return (
		<div
			style={{
				/* Keep the ruler (to calculate the dimensions) hidden. */
				visibility: 'hidden',
				position: 'absolute',
				top: 0,
				left: 0,
			}}
		>
			<div ref={block}> {children} </div>
		</div>
	);
}
