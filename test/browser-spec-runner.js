/* eslint-env browser */
/* global MochaBar, mocha */

mocha.setup({ checkLeaks: true, reporter: MochaBar, ui: 'bdd' });
addEventListener
(
    'DOMContentLoaded',
    async () =>
    {
        await import('./common.spec.js');
        mocha.run();
    },
);
