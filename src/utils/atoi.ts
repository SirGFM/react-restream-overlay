/**
 * atoi converts the value to a number.
 *
 * @param {any} value - The value to be converted.
 * @param {number} fallback - The value used if the conversion fail.
 * @return {number} - The converted number (or fallback, on error).
 */
export default function atoi(value: any, fallback: number = 0.25): number {
	const num = parseFloat(value + '');
	return num ? num : fallback;
}
