export interface Config {
	title: string;
	width: number;
	height: number;
	'run-token'?: string;
	'config-refresh'?: number;
	'timer-refresh'?: number;
	'hide-timer'?: boolean;
}

export const ConfigType = {
	title: 'string' as const,
	width: 'number' as const,
	height: 'number' as const,
	'run-token': 'string' as const,
	'config-refresh': 'number' as const,
	'timer-refresh': 'number' as const,
	'hide-timer': 'boolean' as const,
};
