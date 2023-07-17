'use client';

import { useState } from 'react';
import AutoResizeText from '@/components/AutoResizeText';
import Timer from '@/components/Timer';
import FramedView from '@/components/FramedView';

export default function JSRes() {
	const [text, setText] = useState('');
	const [resText, setResText] = useState('');
	const [text2, setText2] = useState('');
	const [resText2, setResText2] = useState('');

	const [frameL, setFrameL] = useState('0');
	const [frameR, setFrameR] = useState('0');
	const [frameT, setFrameT] = useState('0');
	const [frameB, setFrameB] = useState('0');
	const [showFrame, setShowFrame] = useState(false);

	return (
		<>
			<div>
				<label htmlFor="set-text"> Insert the text: </label>
				<input
					type="text"
					id="set-text"
					name="set-text"
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
			</div>

			<div>
				<input type="button" value="Update" onClick={(e) => setResText(text)} />
			</div>

			<AutoResizeText widthPx={300} heightPx={80} baseFontSize={100}>
				{resText}
			</AutoResizeText>

			<hr />

			<div>
				<label htmlFor="set-text2"> Current time (ms): </label>
				<input
					type="text"
					id="set-time"
					name="set-time"
					value={text2}
					onChange={(e) => setText2(e.target.value)}
				/>
			</div>

			<div>
				<input
					type="button"
					value="Update"
					onClick={(e) => setResText2(text2)}
				/>
			</div>

			<div>
				<label> hour=false min=false ms=false sign=false </label>
				<Timer
					showHour={false}
					hideMin={true}
					showMs={false}
					widthPx={300}
					heightPx={80}
					timeMs={parseInt(resText2)}
				/>
			</div>
			<div>
				<label> hour=true min=false ms=true sign=false </label>
				<Timer
					showHour={true}
					hideMin={true}
					showMs={true}
					widthPx={300}
					heightPx={80}
					timeMs={parseInt(resText2)}
				/>
			</div>
			<div>
				<label> hour=false min=true ms=true sign=false </label>
				<Timer
					showHour={false}
					hideMin={false}
					showMs={true}
					widthPx={300}
					heightPx={80}
					timeMs={parseInt(resText2)}
				/>
			</div>
			<div>
				<label> hour=true min=true ms=true sign=false </label>
				<Timer
					showHour={true}
					hideMin={false}
					showMs={true}
					widthPx={300}
					heightPx={80}
					timeMs={parseInt(resText2)}
				/>
			</div>
			<div>
				<label> hour=false min=true ms=false sign=true </label>
				<Timer
					showHour={false}
					hideMin={false}
					showMs={false}
					showSign={true}
					widthPx={300}
					heightPx={80}
					timeMs={parseInt(resText2)}
				/>
			</div>
			<div>
				<label> hour=false min=false ms=false sign=true </label>
				<Timer
					showHour={false}
					hideMin={true}
					showMs={false}
					showSign={true}
					widthPx={300}
					heightPx={80}
					timeMs={parseInt(resText2)}
				/>
			</div>

			<hr />

			<div>
				<input
					type="number"
					id="set-l"
					name="set-l"
					value={frameL}
					onChange={(e) => setFrameL(e.target.value)}
				/>
				<input
					type="number"
					id="set-r"
					name="set-r"
					value={frameR}
					onChange={(e) => setFrameR(e.target.value)}
				/>
				<input
					type="number"
					id="set-t"
					name="set-t"
					value={frameT}
					onChange={(e) => setFrameT(e.target.value)}
				/>
				<input
					type="number"
					id="set-b"
					name="set-b"
					value={frameB}
					onChange={(e) => setFrameB(e.target.value)}
				/>
				<input
					type="button"
					value={showFrame ? 'Zoom in' : 'Show all'}
					onClick={(e) => setShowFrame((old) => !old)}
				/>
			</div>

			<FramedView
				widthPx={800}
				heightPx={600}
				frameTopPx={parseInt(frameT)}
				frameLeftPx={parseInt(frameL)}
				frameRightPx={parseInt(frameR)}
				frameBottomPx={parseInt(frameB)}
				frameWidthPx={1280}
				frameHeightPx={720}
				showFullFrame={showFrame}
			>
				<iframe
					src="https://player.twitch.tv/?channel=brat&parent=localhost"
					width="1280"
					height="720"
				></iframe>
			</FramedView>
		</>
	);
}
