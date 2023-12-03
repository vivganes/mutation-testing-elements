import fs from 'fs/promises';

/**
 * @type {Partial<import('@stryker-mutator/api/core').PartialStrykerOptions>}
 */
const config = JSON.parse(await fs.readFile('../../stryker.parent.json', 'utf-8'));

config.dashboard = { module: 'elements' };
config.testRunner = 'vitest';
config.plugins = ['@stryker-mutator/*', './debug-reporter.js']
config.reporters.push('debug');

export default config;
