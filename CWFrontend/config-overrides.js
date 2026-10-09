const {alias, aliasJest, configPaths} = require('react-app-rewire-alias')

module.exports = {
	webpack: function override(config) {
		alias(configPaths('./tsconfig.paths.json'))(config)

		return config
	},
	jest: function overrideJest(config) {
		// CRA resolves testMatch against the absolute rootDir, producing mixed
		// path separators that match no files on Windows (jest finds 0 tests).
		// Relative patterns avoid the rootDir join entirely.
		config.testMatch = [
			'**/__tests__/**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}',
			'**/?(*.)+(spec|test).[tj]s?(x)',
		]
		// The CRA boilerplate test asserts a "learn react" link that no longer
		// exists and mounts the full Three.js game (jsdom has no WebGL), so it
		// can never pass. Replacement/removal is owned by the test-strategy
		// story; skip only this one file until then.
		config.testPathIgnorePatterns = ['/node_modules/', 'src/App\\.test\\.tsx$']
		return aliasJest(configPaths('./tsconfig.paths.json'))(config)
	},
}
