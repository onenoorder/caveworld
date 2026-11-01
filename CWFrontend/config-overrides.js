const {alias, configPaths} = require('react-app-rewire-alias')

// Jest configuration lives in jest.config.js (test strategy bd53db55):
// merge it over the CRA defaults so `npm test -- --coverage` enforces the
// 100% lines + methods gate. Keys present in CRA's generated config (e.g.
// collectCoverageFrom) are replaced wholesale — the file is the single source.
function jestOverride(config) {
	const jestConfig = require('./jest.config.js');

	const supported = ['clearMocks', 'collectCoverageFrom', 'coveragePathIgnorePatterns', 'coverageReporters', 'coverageThreshold', 'displayName', 'extraGlobals', 'globalSetup', 'globalTeardown', 'moduleNameMapper', 'resetMocks', 'resetModules', 'restoreMocks', 'snapshotSerializers', 'testMatch', 'transform', 'transformIgnorePatterns', 'watchPathIgnorePatterns'];

	for (const key of supported) {
		if (Object.prototype.hasOwnProperty.call(jestConfig, key)) {
			config[key] = jestConfig[key];
		}
	}

	return config;
}

module.exports = function override(config) {
	alias(configPaths('./tsconfig.paths.json'))(config)

	return config
}

module.exports.jest = jestOverride;
