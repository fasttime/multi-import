export default function multiImport
<T extends string>(...specifiers: readonly T[]): Promise<any[] & { [src in T]: any; }>;
