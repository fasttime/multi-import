# multi-import · [![npm version][npm badge]][npm URL]

Dynamically import multiple ES modules at once.

Example usage:

```js
import multiImport from 'multi-import';

export async function tsTest()
{
    const [{ default: ts }, { fileURLToPath }] = await multiImport('typescript', 'url');

    const fileURL = new URL('test/ts-defs-test.ts', import.meta.url);
    const fileName = fileURLToPath(fileURL);
    const program = ts.createProgram([fileName], { strict: true });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length) {
        const reporter = ts.createDiagnosticReporter(ts.sys, true);
        diagnostics.forEach(reporter);
    }
}
```

[npm badge]: https://badge.fury.io/js/multi-import.svg
[npm URL]: https://www.npmjs.com/package/multi-import
