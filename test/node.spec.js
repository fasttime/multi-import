/* eslint-env mocha, node */

import { strict as assert } from 'assert';

describe
(
    'multi-import',
    () =>
    {
        let multiImport;

        before
        (
            async () =>
            {
                ({ default: multiImport } = await import('../src/multi-import.js'));
            },
        );

        it
        (
            'works with node packages',
            async () =>
            {
                const imports = await multiImport('mocha', 'module');
                const mochaNS = await import('mocha');
                const moduleNS = await import('module');
                assert.equal(imports[0], mochaNS);
                assert.equal(imports[1], moduleNS);
                assert.equal(imports.mocha, mochaNS);
                assert.equal(imports.module, moduleNS);
            },
        );

        it
        (
            'does not set named properties that look like array indices',
            async () =>
            {
                const specifier = 42;
                const imports = await multiImport(specifier);
                assert.equal(imports[0], await import(specifier));
                assert(!(specifier in imports));
            },
        );

        it
        (
            'does not set a property named "length"',
            async () =>
            {
                const specifier = 'length';
                const imports = await multiImport(specifier);
                assert.equal(imports[0], await import(specifier));
                assert.equal(imports.length, 1);
            },
        );
    },
);
