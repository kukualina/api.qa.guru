// // @ts-check
// const { defineConfig, devices } = require('@playwright/test');

// /**
//  * Read environment variables from file.
//  * https://github.com/motdotla/dotenv
//  */
// // require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// /**
//  * @see https://playwright.dev/docs/test-configuration
//  */
// module.exports = defineConfig({
//     testDir: './tests',
//     /* Run tests in files in parallel */
//     fullyParallel: false,
//     /* Fail the build on CI if you accidentally left test.only in the source code. */
//     forbidOnly: !!process.env.CI,
//     /* Retry on CI only */
//     retries: process.env.CI ? 2 : 0,
//     /* Opt out of parallel tests on CI. */
//     //workers: process.env.CI ? 1 : undefined,
//     workers: process.env.CI ? 1 : 1,
//     /* Reporter to use. See https://playwright.dev/docs/test-reporters */
//     //reporter: [['line']],
//     // reporter: [
//     //     ['list'], // вывод в консоль
//     //     [AllureReporter, { outputFolder: 'allure-results' }], // настройка Allure
//     // ],
//     reporter: [
//         ['line'],
//         ['html', { open: 'never' }],
//         [
//             'allure-playwright',
//             {
//                 detail: true,
//                 suiteTitle: false,
//                 environmentInfo: {
//                     // @ts-ignore
//                     os_platform: os.platform(),
//                     // @ts-ignore
//                     os_release: os.release(),
//                     // @ts-ignore
//                     os_version: os.version(),
//                     node_version: process.version,
//                 },
//             },
//         ],
//     ],
//     // ['allure - playwright'],
//     /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
//     use: {
//         /* Base URL to use in actions like `await page.goto('/')`. */
//         // baseURL: 'http://127.0.0.1:3000',

//         /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
//         trace: 'on-first-retry',
//     },

//     /* Configure projects for major browsers */
//     projects: [
//         {
//             name: 'chromium',
//             use: { ...devices['Desktop Chrome'] },
//         },

//         // {
//         //     name: 'firefox',
//         //     use: { ...devices['Desktop Firefox'] },
//         // },

//         // {
//         //     name: 'webkit',
//         //     use: { ...devices['Desktop Safari'] },
//         // },

//         /* Test against mobile viewports. */
//         // {
//         //   name: 'Mobile Chrome',
//         //   use: { ...devices['Pixel 5'] },
//         // },
//         // {
//         //   name: 'Mobile Safari',
//         //   use: { ...devices['iPhone 12'] },
//         // },

//         /* Test against branded browsers. */
//         // {
//         //   name: 'Microsoft Edge',
//         //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
//         // },
//         // {
//         //   name: 'Google Chrome',
//         //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
//         // },
//     ],

//     /* Run your local dev server before starting the tests */
//     // webServer: {
//     //   command: 'npm run start',
//     //   url: 'http://127.0.0.1:3000',
//     //   reuseExistingServer: !process.env.CI,
//     // },
// });

import * as os from 'os';
const { defineConfig, devices } = require('@playwright/test');

// @ts-check

// if (process.env.ENVIRONMENT) {
//     config({
//         path: `.env.${process.env.ENVIRONMENT}`,
//         override: true,
//     });
// } else {
//     console.log(process.env.ENVIRONMENT);

// }
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
const { defineConfig } = require('@playwright/test');
const { AllureReporter } = require('allure-playwright');

module.exports = defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['line'],
        ['list'],
        [AllureReporter, { outputDir: 'allure-results' }][('html', { open: 'never' })], // репортер Allure
        [
            'allure-playwright',
            {
                detail: true,
                suiteTitle: false,
                environmentInfo: {
                    os_platform: os.platform(),
                    os_release: os.release(),
                    os_version: os.version(),
                    node_version: process.version,
                },
            },
        ],
    ],

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        ignoreHTTPSErrors: true,
        trace: 'on-first-retry',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

     Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
