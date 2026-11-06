import config from '@iobroker/eslint-config';

export default [
    ...config,
    {
        languageOptions: {
            parserOptions: {
                allowDefaultProject: {
                    allow: ['*.js', '*.mjs'],
                },
                tsconfigRootDir: import.meta.dirname,
                // project: './tsconfig.json',
            },
        },
    },
    {
        // disable temporary the rule 'jsdoc/require-param' and enable 'jsdoc/require-jsdoc'
        rules: {
            'jsdoc/require-jsdoc': 'off',
            'jsdoc/require-param': 'off',
            'jsdoc/check-param-names': 'off',
        },
    },
    {
        ignores: [
            'build/**/*',
            'src/lib/**/*.js',
            'admin/**/*',
            // The device widgets are a separate Vite project with their own toolchain and tsconfig
            'src-devices/**/*',
            'src-widgets/**/*',
            // the web components are a Vite project of their own too, linted with `npm run lint:wc`
            'src-webcomponents/**/*',
            'widgets/**/*',
            'test/**/*',
            'src-admin/**/*',
            'src-rules/**/*',
            'tasks.js',
            'tmp/**/*',
            '**/*.mjs'
        ],
    },
];
