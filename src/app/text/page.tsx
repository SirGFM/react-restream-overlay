'use client';

import { useCallback, useState } from 'react';
import Ruler from '@/components/Ruler';
import ScrollingText from '@/components/ScrollingText';

export default function Text() {
	const [text, setText] = useState('');
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const onText = useCallback((e: any) => setText(e.target.value), [setText]);

	console.log(`w: ${width}`);
	console.log(`h: ${height}`);

	return (
		<div style={{ backgroundColor: 'white', color: 'black' }}>
			<div>
				<label htmlFor="text"> Text: </label>
				<input
					type="text"
					id="text"
					name="text"
					value={text}
					onChange={onText}
				/>
			</div>

			<Ruler widthSetter={setWidth} heightSetter={setHeight}>
				<div>
					<p>{text}</p>
				</div>
			</Ruler>

			<ScrollingText
				scrollSpeed={50}
				widthPx={100}
				heightPx={60}
				separator="--"
			>
				{text}
			</ScrollingText>
		</div>
	);
}
