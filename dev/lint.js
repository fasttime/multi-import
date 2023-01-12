#!/usr/bin/env node

import { lint }             from '@fasttime/lint';
import { fileURLToPath }    from 'url';

const workspaceFolder = fileURLToPath(new URL('..', import.meta.url));
process.chdir(workspaceFolder);
await lint
(
    {
        envs:           'shared-node-browser',
        jsVersion:      2020,
        src:            ['lib/*.ts', '{src,test}/**/*.js'],
        parserOptions:  { project: 'tsconfig.json', sourceType: 'module' },
    },
    {
        envs:           'shared-node-browser',
        jsVersion:      2020,
        src:            'test/**/*.cjs',
    },
    {
        src:            'dev/*.js',
        jsVersion:      2022,
        envs:           'node',
        parserOptions:  { sourceType: 'module' },
    },
);
