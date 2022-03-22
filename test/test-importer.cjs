'use strict';

{
    const testImporter = multiImport => (...specifiers) => multiImport(...specifiers);
    if (typeof module !== 'undefined')
        module.exports = testImporter; // eslint-disable-line no-undef
    else
        globalThis['test-importer'] = { default: testImporter };
}
