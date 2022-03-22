#!/usr/bin/env node

import { rollup }           from 'rollup';
import { fileURLToPath }    from 'url';

const workspaceFolder = fileURLToPath(new URL('..', import.meta.url));
process.chdir(workspaceFolder);
const bundle = await rollup({ input: 'src/index.js' });
const esmDynamicImport = { renderDynamicImport: () => ({ left: 'import(', right: ')' }) };
const outputOptionsList =
[
    { file: 'lib/multi-import.js', format: 'esm' },
    { extend: true, file: 'lib/multi-import.script.cjs', format: 'iife', name: 'multi-import' },
    { file: 'lib/multi-import.cjs', exports: 'auto', format: 'cjs', plugins: [esmDynamicImport] },
];
for (const outputOptions of outputOptionsList)
    await bundle.write(outputOptions);
