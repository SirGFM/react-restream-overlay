type DataType = { [key: string]: 'string' | 'number' | 'boolean' };

/**
 * reqForm sends a request configured for form-data.
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
export default function reqForm(
	endpoint: string,
	dataType: DataType,
	extraOptions?: any,
	callback?: (data?: any) => void,
	onError?: (status: number) => void
) {
	const options = {
		...extraOptions,
		cache: 'no-store' as const,
		headers: {
			'content-type': 'multipart/form-data' as const,
		},
	};

	fetch(endpoint, options).then((res) => {
		if (!res.ok) {
			console.error(res.statusText);
			onError?.(res.status);

			return;
		}

		if (res.status == 200 && callback) {
			res.formData().then((data) => {
				/* Iterate over each key in the type object,
				 * converting the value in the form to a value of the specified type. */
				const form = Object.fromEntries(
					Object.entries(dataType)
						.map(([key, typ]) => {
							const value = data.get(key);

							if (typeof value === 'undefined') {
								return [key, undefined];
							}

							switch (typ) {
								case 'string':
									return [key, value + ''];
								case 'number':
									return [key, parseInt(value + '')];
								case 'boolean':
									return [key, !!value];
							}
						})
						.filter((value) => !!value)
				);

				callback(form);
			});
		} else if (res.status == 204 && callback) {
			callback();
		}
	});
}
