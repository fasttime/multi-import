import type multiImport from './multi-import';

declare global
{
    interface Window
    {
        readonly ['multi-import']: typeof multiImport;
    }
}
