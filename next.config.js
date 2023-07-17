/** @type {import('next').NextConfig} */
const prodNextConfig = {
	output: 'export',
	distDir: 'build',
};

/** @type {import('next').NextConfig} */
const devNextConfig = {
	async rewrites() {
		return [
			{
				source: '/:path*',
				destination: process.env.API_URL + '/:path*',
			},
		];
	},
};

if (process.env.NODE_ENV == 'development') {
	module.exports = devNextConfig;
} else {
	module.exports = prodNextConfig;
}
