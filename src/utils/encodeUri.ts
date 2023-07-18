/**
 * encodeRFC3986URIComponent encodes a string complying to RFC-3986.
 *
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#encoding_for_rfc3986
 *
 * @param {string} str - The component to be fully encoded.
 * @return {string} - The encoded string.
 */
export default function encodeRFC3986URIComponent(str: string): string {
	return encodeURIComponent(str).replace(
		/[!'()*]/g,
		(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
	);
}
