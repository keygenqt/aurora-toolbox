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
import { AppConstants } from '../constants/AppConstants.js';

export const AuroraAPI = {
    //////////////////////////////////////////
    // Emulator
    /**
     * Start emulator
     *
     * @returns route
     */
    emulatorStart: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/emulator/start'
        ]
    },
    /**
     * Get info emulator
     *
     * @returns route
     */
    emulatorInfo: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/emulator/info'
        ]
    },
    //////////////////////////////////////////
    // Device
    /**
     * Get list devices
     *
     * @returns route
     */
    deviceList: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/device/list'
        ]
    },
    /**
     * Get info device
     *
     * @returns route
     */
    deviceInfo: function(host) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/device/info'.argUri({
                host: host,
            })
        ]
    },
    /**
     * Execute command
     *
     * @returns route
     */
    deviceCommand: function(host, execute) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/device/command'.argUri({
                host: host,
                execute: execute,
            })
        ]
    },
    //////////////////////////////////////////
    // Settings
    /**
     * Get list settings
     *
     * @returns route
     */
    settingsList: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/settings/list'
        ]
    },
    /**
     * Clear settings
     *
     * @returns route
     */
    settingsClear: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/settings/clear'
        ]
    },
    /**
     * Localization settings
     *
     * @returns route
     */
    settingsLocalization: function(language) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/settings/localization'.argUri({
                language: language,
            })
        ]
    },
    /**
     * Verbose settings
     *
     * @returns route
     */
    settingsVerbose: function(enable) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/settings/verbose'.argUri({
                enable: enable,
            })
        ]
    },
    /**
     * Select settings
     *
     * @returns route
     */
    settingsSelect: function(enable) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/settings/select'.argUri({
                enable: enable,
            })
        ]
    },
    /**
     * Hint settings
     *
     * @returns route
     */
    settingsHint: function(enable) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/settings/hint'.argUri({
                enable: enable,
            })
        ]
    },
    //////////////////////////////////////////
    // Info
    /**
     * Get path to configuration
     *
     * @returns route
     */
    infoPathConfiguration: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/info/path/configuration'
        ]
    },
    /**
     * Get version application
     *
     * @returns route
     */
    infoVersion: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/info/version'
        ]
    },
    //////////////////////////////////////////
    // Tests
    /**
     * Test types answer
     *
     * @param {number} time - sleep ms
     * @param {number} code - response types
     * @param {number} iterate - multiple answer
     * @returns route
     */
    testAnswer: function(time = 0, code = 200, iterate = 1) {
        return [
            ...AppConstants.AuroraCLI, 'api', '--route',
            '/tests/answer'.argUri({
                time: time,
                code: code,
                iterate: iterate,
            })
        ]
    },
};
