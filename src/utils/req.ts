/**
 * req sends a request configured for JSON.
 *
 * By default, it sends a GET request.
 *
 * @param {string} endpoint - The endpoint being requested.
 * @param {any} extraOptions - Additional parameters, like the 'method' and the 'body'.
 * @param {(data?: any) => void} callback - Function called on success.
 *                                        - On OK (200), the response body is passed to this callback.
 *                                        - On NoContent (204), the callback is called without any args.
 * @param {(status: number) => void} onError - Function called on error, with the status code.
 */
export default function req(
	endpoint: string,
	extraOptions?: any,
	callback?: (data?: any) => void,
	onError?: (status: number) => void
) {
	const options = {
		...extraOptions,
		cache: 'no-store' as const,
		headers: {
			'content-type': 'application/json' as const,
		},
	};

	fetch(endpoint, options).then((res) => {
		if (!res.ok) {
			console.error(res.statusText);
			onError?.(res.status);

			return;
		}

		if (res.status == 200 && callback) {
			res.json().then((data) => {
				callback(data);
			});
		} else if (res.status == 204 && callback) {
			callback();
		}
	});
}
