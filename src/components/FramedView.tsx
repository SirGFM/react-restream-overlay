interface FramedViewProp {
	/** Whether the full frame should be visible,
	 * but with the hidden part grayed out. */
	showFullFrame?: boolean;
	/** Width of the outer container. */
	widthPx: number;
	/** Height of the outer container. */
	heightPx: number;
	/** Position of the left-most column within the inner container. */
	frameLeftPx: number;
	/** Position of the right-most column within the inner container. */
	frameRightPx: number;
	/** Position of the top row within the inner container. */
	frameTopPx: number;
	/** Position of the bottom row within the inner container. */
	frameBottomPx: number;
	/** Width of the inner container. */
	frameWidthPx: number;
	/** Height of the inner container. */
	frameHeightPx: number;
	/** The actual framed component. */
	children: React.ReactNode;
}

export default function FramedView(props: FramedViewProp) {
	let width = props.frameWidthPx;
	let height = props.frameHeightPx;
	let left = 0;
	let top = 0;

	/* Adjust the viewBox so the internal component is cropped. */
	if (!props.showFullFrame) {
		width -= props.frameLeftPx + props.frameRightPx;
		height -= props.frameTopPx + props.frameBottomPx;
		left = props.frameLeftPx;
		top = props.frameTopPx;
	}

	return (
		<svg
			viewBox={`${left} ${top} ${width} ${height}`}
			width={props.widthPx}
			height={props.heightPx}
			preserveAspectRatio="none"
		>
			<foreignObject width={props.frameWidthPx} height={props.frameHeightPx}>
				<div style={{ position: 'absolute' }}>{props.children}</div>
				{props.showFullFrame ? (
					<>
						<div
							style={{
								position: 'absolute',
								width: props.frameLeftPx + 'px',
								height: props.frameHeightPx + 'px',
								backgroundColor: 'rgba(255, 200, 175, 0.5)',
							}}
						>
							{' '}
						</div>

						<div
							style={{
								position: 'absolute',
								left: props.frameWidthPx - props.frameRightPx + 'px',
								width: props.frameRightPx + 'px',
								height: props.frameHeightPx + 'px',
								backgroundColor: 'rgba(255, 200, 175, 0.5)',
							}}
						>
							{' '}
						</div>

						<div
							style={{
								position: 'absolute',
								width: props.frameWidthPx + 'px',
								height: props.frameTopPx + 'px',
								backgroundColor: 'rgba(255, 200, 175, 0.5)',
							}}
						>
							{' '}
						</div>

						<div
							style={{
								position: 'absolute',
								width: props.frameWidthPx + 'px',
								top: props.frameHeightPx - props.frameBottomPx + 'px',
								height: props.frameBottomPx + 'px',
								backgroundColor: 'rgba(255, 200, 175, 0.5)',
							}}
						>
							{' '}
						</div>
					</>
				) : null}
			</foreignObject>
		</svg>
	);
}
