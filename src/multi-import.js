export function createGetCallerURL()
{
    const { captureStackTrace } = Error;
    const getCallerURL =
    captureStackTrace ?
    () =>
    {
        const percentRegEx = /%/g;
        const backslashRegEx = /\\/g;
        const newlineRegEx = /\n/g;
        const carriageReturnRegEx = /\r/g;
        const tabRegEx = /\t/g;
        // eslint-disable-next-line no-undef
        const isWindows = typeof process !== 'undefined' && process.platform === 'win32';

        function encodePathChars(fileName)
        {
            fileName =
            fileName
            .replace(percentRegEx, '%25')
            .replace(newlineRegEx, '%0A')
            .replace(carriageReturnRegEx, '%0D')
            .replace(tabRegEx, '%09');
            // In posix, backslash is a valid character in paths:
            if (!isWindows)
                fileName = fileName.replace(backslashRegEx, '%5C');
            return fileName;
        }

        let url;
        const { prepareStackTrace } = Error;
        Error.prepareStackTrace =
        (_, callSites) =>
        {
            for (const callSite of callSites)
            {
                const fileName = callSite.getFileName();
                if (fileName != null)
                {
                    if (/^[a-z][+\-.0-9a-z]+:/i.test(fileName))
                        url = fileName;
                    else
                    {
                        const outURL = new URL('file://');
                        outURL.pathname = encodePathChars(fileName);
                        url = outURL.toString();
                    }
                    break;
                }
            }
        };
        {
            const targetObject = { };
            const originalStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = Infinity;
            captureStackTrace(targetObject, multiImport);
            Error.stackTraceLimit = originalStackTraceLimit;
            void targetObject.stack;
        }
        Error.prepareStackTrace = prepareStackTrace;
        return url;
    } :
    () =>
    {
        const { stack } = new Error();
        const match = stack.match(/^.*\n.*\n(?:.*@(?:\[native code\])?\n)*.*@(.*):\d+:\d+/);
        if (match)
        {
            const [, url] = match;
            return url;
        }
    };
    return getCallerURL;
}

const getCallerURL = createGetCallerURL();

const hasOwnProperty = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

function isArrayIndex(str)
{
    const number = +str;
    return str === `${number}` && Number.isInteger(number) && number >= 0 && number <= 0xfffffffe;
}

const multiImport =
async (...specifiers) =>
{
    const callerURL = getCallerURL();
    if (callerURL == null || callerURL.startsWith('node:'))
        throw Error('multi-import was invoked from an unsupported call site');
    const srcs = specifiers.map(specifier => `${specifier}`);
    const imports =
    srcs.map
    (
        src =>
        {
            if (/^[./]/.test(src))
                src = new URL(src, callerURL);
            return import(src);
        },
    );
    const array = await Promise.all(imports);
    array.forEach
    (
        (namespace, index) =>
        {
            const src = srcs[index];
            if (!isArrayIndex(src) && !hasOwnProperty(array, src))
            {
                Reflect.defineProperty
                (array, src, { configurable: true, value: namespace, writable: true });
            }
        },
    );
    return array;
};

export { multiImport as default };
