/* eslint-env mocha, node */

import { toDataURL } from './utils.js';

function useOrImport(name, src)
{
    const returnValue = name in globalThis ? globalThis[name] : import(src);
    return returnValue;
}

let assert;

before
(
    async () =>
    {
        ({ assert } = await useOrImport('chai', 'chai'));
    },
);

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

        after
        (
            () =>
            {
                multiImport = undefined;
            },
        );

        it
        (
            'loads modules from different types of URLs',
            async () =>
            {
                const dataURL = toDataURL('0;\n');
                const imports = await multiImport('./test-module.js', dataURL);
                const testNS = await import('./test-module.js');
                const dataNS = await import(dataURL);
                assert.strictEqual(imports[0], await testNS);
                assert.strictEqual(imports[1], await dataNS);
                assert.strictEqual(imports['./test-module.js'], await testNS);
                assert.strictEqual(imports[dataURL], await dataNS);
            },
        );

        it
        (
            'works when called from native code',
            async () =>
            {
                const [actualNS] =
                await './test-module.js'.search({ [Symbol.search]: multiImport });
                const expectedNS = await import('./test-module.js');
                assert.strictEqual(actualNS, expectedNS);
            },
        );

        it
        (
            'works when called from eval code',
            async () =>
            {
                const evalBody = 'multiImport("./test-module.js")';
                const [actualNS] = await eval(evalBody);
                const expectedNS = await import('./test-module.js');
                assert.strictEqual(actualNS, expectedNS);
            },
        );

        it
        (
            'works when called from Function code',
            async () =>
            {
                const fnBody = 'return multiImport("./test-module.js")';
                const [actualNS] = await Function('multiImport', fnBody)(multiImport);
                const expectedNS = await import('./test-module.js');
                assert.strictEqual(actualNS, expectedNS);
            },
        );

        it
        (
            'works when called from nested untraced code',
            async () =>
            {
                const evalBody = '"./test-module.js".search({ [Symbol.search]: multiImport })';
                const fnBody = `return eval(${JSON.stringify(evalBody)})`;
                const [actualNS] = await Function('multiImport', fnBody)(multiImport);
                const expectedNS = await import('./test-module.js');
                assert.strictEqual(actualNS, expectedNS);
            },
        );

        it
        (
            'is not a costructor',
            () => assert.throws(() => new multiImport(), TypeError), // eslint-disable-line new-cap
        );

        it
        (
            'works outside an ES module',
            async () =>
            {
                const { default: testImporter } =
                await useOrImport('test-importer', './test-importer.cjs');
                const imports = await testImporter(multiImport)('./test-module.js');
                const testNS = await import('./test-module.js');
                assert.strictEqual(imports[0], testNS);
                assert.strictEqual(imports['./test-module.js'], testNS);
            },
        );

        it
        (
            'silently settles when invoked from an unsupported call site',
            done =>
            {
                const handleRejection = event => event.preventDefault();
                if (typeof addEventListener === 'function')
                {
                    // eslint-disable-next-line no-undef
                    addEventListener('unhandledrejection', handleRejection, { once: true });
                }
                setTimeout(multiImport);
                setTimeout
                (
                    () =>
                    {
                        if (typeof removeEventListener === 'function')
                        {
                            // eslint-disable-next-line no-undef
                            removeEventListener('unhandledrejection', handleRejection);
                        }
                        done();
                    },
                    20,
                );
            },
        );
    },
);

describe
(
    'createGetCallerURL in non-V8 mode',
    () =>
    {
        let createGetCallerURL;
        let originalError;

        before
        (
            async () =>
            {
                ({ createGetCallerURL } = await import('../src/multi-import.js'));
            },
        );

        after
        (
            () =>
            {
                createGetCallerURL = undefined;
            },
        );

        beforeEach
        (
            () =>
            {
                originalError = Error;
                globalThis.Error =
                class
                { };
            },
        );

        afterEach
        (
            () =>
            {
                globalThis.Error = originalError;
                originalError = undefined;
            },
        );

        it
        (
            'does not find a caller URL',
            () =>
            {
                Error.prototype.stack = ''; // eslint-disable-line no-extend-native
                const getCallerURL = createGetCallerURL(Error);
                const url = getCallerURL();
                assert.isUndefined(url);
            },
        );

        it
        (
            'finds a caller URL',
            () =>
            {
                Error.prototype.stack = // eslint-disable-line no-extend-native
                'foo\n' +
                'bar\n' +
                'asyncFunctionResume@[native code]\n' +
                '@https://example.org/caller.js:42:43';
                const getCallerURL = createGetCallerURL(Error);
                const url = getCallerURL();
                assert.strictEqual(url, 'https://example.org/caller.js');
            },
        );
    },
);
