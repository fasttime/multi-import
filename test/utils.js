export function toDataURL(inputStr)
{
    const base64Str =
    typeof Buffer === 'function' ?
    Buffer.from(inputStr).toString('base64') : // eslint-disable-line no-undef
    btoa(unescape(encodeURIComponent(inputStr)));
    const dataURL = `data:text/javascript;base64,${base64Str}`;
    return dataURL;
}
