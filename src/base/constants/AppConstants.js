/**
 * Copyright 2024 Vitaliy Zarubin
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import GLib from 'gi://GLib';

export const AppConstants = Object.freeze({
    App: {
        version: '1.0.2',
        doc: 'https://keygenqt.github.io/aurora-toolbox/',
        docInstall: 'https://keygenqt.github.io/aurora-toolbox/install/',
        latestRelease: 'https://api.github.com/repos/keygenqt/aurora-toolbox/releases/latest',
    },
    AppCLI: {
        doc: 'https://keygenqt.github.io/aurora-cli/',
        docInstall: 'https://keygenqt.github.io/aurora-cli/install/',
    },
    Docs: {
        sdk: 'https://developer.auroraos.ru/doc/sdk',
        psdk: 'https://developer.auroraos.ru/doc/sdk/psdk',
        flutter: 'https://omprussia.gitlab.io/flutter/flutter',
        vscode: 'https://code.visualstudio.com/docs'
    },
    AuroraCLI: [
        `${GLib.getenv('HOME')}/.local/bin/aurora-cli`,
        // @todo debug
        // 'python3',
        // '/home/keygenqt/Documents/Home/Projects/aurora-cli/builds/aurora-cli-3.0.13.pyz'
    ],
    Language: {
        'ru': 'ru_RU.utf-8',
        'en': 'en_US.utf-8',
    },
    Pages: {
        DevicePage:     'tag-DevicePage',
        DevicesPage:    'tag-DevicesPage',
        EmulatorPage:   'tag-EmulatorPage',
        FlutterPage:    'tag-FlutterPage',
        PsdkPage:       'tag-PsdkPage',
        PsdksPage:      'tag-PsdksPage',
        PsdkTargetPage: 'tag-PsdkTargetPage',
        SdkPage:        'tag-SdkPage',
        ToolsPage:      'tag-ToolsPage',
        VscodePage:     'tag-VscodePage',
        WelcomePage:    'tag-WelcomePage',
    }
});
