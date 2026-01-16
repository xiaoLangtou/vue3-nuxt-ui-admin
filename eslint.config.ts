import * as fs from 'node:fs';
import antfu from '@antfu/eslint-config';
import pluginQuery from '@tanstack/eslint-plugin-query';
import { createAutoInsert } from 'eslint-plugin-unimport';

export default antfu(
    {
        vue: true,
        typescript: true,
        formatters: {
            css: true,
            html: true,
            markdown: 'prettier',
        },
        stylistic: {
            indent: 2,
            quotes: 'single',
            semi: true,
        },
        ignores: [
            '**/node_modules',
            '**/dist',
            '**/public',
            '**/.nuxt',
            '**/coverage',
        ],
        rules: {
            "top-level-function": "warn"
        }
    },
    pluginQuery.configs['flat/recommended'],
    createAutoInsert({
        imports: JSON.parse(fs.readFileSync('.unimport-items.json', 'utf-8')),
    }),
);
