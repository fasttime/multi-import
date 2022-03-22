#!/usr/bin/env node

import FastGlob             from 'fast-glob';
import { rm }               from 'fs/promises';
import { fileURLToPath }    from 'url';

const workspaceFolder = fileURLToPath(new URL('..', import.meta.url));
const fastGlobOptions = { absolute: true, cwd: workspaceFolder };
const rmOptions = { force: true, recursive: true };
const promises =
['coverage', 'lib/*.{cjs,js}'].map
(
    async source =>
    {
        const paths = await FastGlob(source, fastGlobOptions);
        const promises = paths.map(path => rm(path, rmOptions));
        await Promise.all(promises);
    },
);

await Promise.all(promises);
