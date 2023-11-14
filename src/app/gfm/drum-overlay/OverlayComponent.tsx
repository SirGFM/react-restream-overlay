import { useEffect, useState } from 'react';

export interface OverlayComponentProps {
	/** The image's className. */
	className: string;
	/** Whether this image should currently be visible or not. */
	lastPress: string;
	/** How long an activation stays visible (in ms).
	 * Defaults to 200ms if not specified. */
	duration?: number;
}

/**
 * OverlayComponent displays the component for a while after it was pressed.
 *
 * @param {string} className - Class(es) applied to the component.
 * @param {string} lastPress - Parseable date when the button it represents was last pressed.
 * @param {string} duration - For how long the component should be visible.
 */
export default function OverlayComponent(props: OverlayComponentProps) {
	const [visible, setVisible] = useState(false);

	const { className, lastPress, duration } = props;
	const defDuration = duration ?? 200;

	/* If a date in the future wa provided,
	 * set the component as visible
	 * and configure the timer that will hide it again. */
	useEffect(() => {
		if (!lastPress) {
			return;
		}

		const pressDate = Date.parse(lastPress);
		if (!pressDate) {
			console.error(`failed to parse the press date: ${lastPress}`);
			return;
		}

		const timeout = defDuration + pressDate - Date.now();
		if (timeout <= 0) {
			console.warn('timeout already expired');
			return;
		}

		const id = setTimeout(() => setVisible(false), timeout);
		setVisible(true);
		return () => {
			clearTimeout(id);
		};
	}, [setVisible, lastPress, defDuration]);

	if (!visible) {
		return null;
	}
	return <div className={className} />;
}
