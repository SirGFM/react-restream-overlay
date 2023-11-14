import './drum-overlay.css';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

/** Map each action name to its icon. */
const nameToAction: { [key in string]: string } = {
	UP: '⭡',
	'UP,LEFT': '⭦',
	'LEFT,UP': '⭦',
	LEFT: '⭠',
	'LEFT,DOWN': '⭩',
	'DOWN,LEFT': '⭩',
	DOWN: '⭣',
	'DOWN,RIGHT': '⭨',
	'RIGHT,DOWN': '⭨',
	RIGHT: '⭢',
	'RIGHT,UP': '⭧',
	'UP,RIGHT': '⭧',
	'NEXT-ACTION': '⟳',
	'PREV-ACTION': '⟲',
	'RESET-ACTION': '⮌',
	'CHANGE-MODE': '🗘',
	ATTACK: '⚔️',
	JUMP: '🦶',
	SKILL: '🪄',
	SPELL: '💣',
	PAUSE: '=',
	SWAP: '✨',
};

interface ActionIconConfig {
	/** Map each key combination to its icon. */
	key2action: { [key in string]: string };
}

export function useActionIconConfig(): ActionIconConfig {
	/** Load the keys -> name mappings from the query string. */
	const queryString = useSearchParams();
	const actionKey = queryString.get('action_key') ?? 'Z';
	const jumpKey = queryString.get('jump_key') ?? 'SPACE';
	const skillKey = queryString.get('skill_key') ?? 'X';
	const spellKey = queryString.get('spell_key') ?? 'C';
	const pauseKey = queryString.get('pause_key') ?? 'V';
	const swapKey = queryString.get('swap_key') ?? 'S';

	const key2action = useMemo(() => {
		return {
			[actionKey]: 'ATTACK',
			[jumpKey]: 'JUMP',
			[skillKey]: 'SKILL',
			[spellKey]: 'SPELL',
			[pauseKey]: 'PAUSE',
			[swapKey]: 'SWAP',
		};
	}, [actionKey, jumpKey, skillKey, spellKey, pauseKey, swapKey]);

	return { key2action };
}

export interface ActionIconProps {
	/** The horizontal position, in pixels. */
	x: number;
	/** The vertical position, in pixels. */
	y: number;
	/** The keys that are activated by this. */
	keys: string;
}

export default function ActionIcon(props: ActionIconProps) {
	const { x, y, keys } = props;

	const { key2action } = useActionIconConfig();

	const name = key2action[keys] ?? keys;
	const action = nameToAction[name];

	if (name == 'SWAP') {
		const overlay = nameToAction['NEXT-ACTION'];
		return (
			<>
				<p className={`action ${name}`} style={{ left: x, top: y }}>
					{action}
				</p>
				<p className={`action ${name}`} style={{ left: x, top: y }}>
					{overlay}
				</p>
			</>
		);
	}

	return (
		<p className={`action ${name}`} style={{ left: x, top: y }}>
			{action}
		</p>
	);
}
