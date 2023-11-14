import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useActionIconConfig } from './ActionIcon';

type setter = { [key in string]: Dispatch<SetStateAction<boolean>> };

export interface KeyConfig {
	/** Setter for each key. */
	keysSetter: setter;
	/** Whether the attack key is pressed. */
	attack: boolean;
	/** Whether the skill key is pressed. */
	skill: boolean;
	/** Whether the spell key is pressed. */
	spell: boolean;
	/** Whether the jump key is pressed. */
	jump: boolean;
	/** Whether the swap key is pressed. */
	swap: boolean;
	/** Whether the pause key is pressed. */
	pause: boolean;
	/** Whether the up key is pressed. */
	up: boolean;
	/** Whether the down key is pressed. */
	down: boolean;
	/** Whether the left key is pressed. */
	left: boolean;
	/** Whether the right key is pressed. */
	right: boolean;
}

/**
 * useKeyConfig creates state variables for every key,
 * returning their setters in a map,
 * simplifying setting a state from a key name.
 */
export function useKeyConfig(): KeyConfig {
	const [attack, setAttack] = useState(false);
	const [skill, setSkill] = useState(false);
	const [spell, setSpell] = useState(false);
	const [jump, setJump] = useState(false);
	const [swap, setSwap] = useState(false);
	const [pause, setPause] = useState(false);
	const [up, setUp] = useState(false);
	const [down, setDown] = useState(false);
	const [left, setLeft] = useState(false);
	const [right, setRight] = useState(false);

	const { key2action } = useActionIconConfig();

	/* Prepare the setter, mapping each key to its setter. */
	const keysSetter = useMemo(() => {
		let keysSetter: setter = {
			UP: setUp,
			DOWN: setDown,
			LEFT: setLeft,
			RIGHT: setRight,
		};

		Object.entries(key2action).forEach(([key, name]) => {
			switch (name) {
				case 'ATTACK':
					keysSetter[key] = setAttack;
					break;
				case 'SKILL':
					keysSetter[key] = setSkill;
					break;
				case 'SPELL':
					keysSetter[key] = setSpell;
					break;
				case 'JUMP':
					keysSetter[key] = setJump;
					break;
				case 'SWAP':
					keysSetter[key] = setSwap;
					break;
				case 'PAUSE':
					keysSetter[key] = setPause;
					break;
			}
		});

		return keysSetter;
	}, [
		key2action,
		setAttack,
		setSkill,
		setSpell,
		setJump,
		setSwap,
		setPause,
		setUp,
		setDown,
		setLeft,
		setRight,
	]);

	return {
		keysSetter,
		attack,
		skill,
		spell,
		jump,
		swap,
		pause,
		up,
		down,
		left,
		right,
	};
}
