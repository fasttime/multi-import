#!/usr/bin/env node

import { lint }             from '@fasttime/lint';
import { fileURLToPath }    from 'url';

const workspaceFolder = fileURLToPath(new URL('..', import.meta.url));
process.chdir(workspaceFolder);
await lint
(
    {
        envs: 'shared-node-browser',
        src: ['lib/*.ts', '{src,test}/**/*.js'],
        parserOptions: { ecmaVersion: 2020, project: 'tsconfig.json', sourceType: 'module' },
    },
    {
        envs: 'shared-node-browser',
        src: 'test/**/*.cjs',
        parserOptions: { ecmaVersion: 2020, project: 'tsconfig.json' },
    },
    {
        src: 'dev/*.js',
        envs: 'node',
        parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
);
