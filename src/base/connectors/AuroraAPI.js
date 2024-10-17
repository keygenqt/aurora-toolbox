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
    // PSDK
    /**
     * Get installed PSDK
     *
     * @returns route
     */
    psdkInstalled: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/psdk/installed'
        ]
    },
    /**
     * Get available PSDK
     *
     * @returns route
     */
    psdkAvailable: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/psdk/available'
        ]
    },
    /**
     * Get info about PSDK
     *
     * @returns route
     */
    psdkInfo: function(version) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/psdk/info'.argUri({
                version: version,
            })
        ]
    },
    /**
     * Get info about PSDK
     *
     * @returns route
     */
    psdkTargets: function(version) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/psdk/targets'.argUri({
                version: version,
            })
        ]
    },
    /**
     * Add user sudoers for PSDK
     *
     * @returns route
     */
    psdkSudoersAdd: function(version) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/psdk/sudoers/add'.argUri({
                version: version,
            })
        ]
    },
    /**
     * Del user sudoers for PSDK
     *
     * @returns route
     */
    psdkSudoersDel: function(version) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/psdk/sudoers/remove'.argUri({
                version: version,
            })
        ]
    },
    //////////////////////////////////////////
    // Flutter
    /**
     * Get installed Flutter SDK
     *
     * @returns route
     */
    flutterInstalled: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/flutter/installed'
        ]
    },
    /**
     * Get available Flutter SDK
     *
     * @returns route
     */
    flutterAvailable: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/flutter/available'
        ]
    },
    //////////////////////////////////////////
    // Vscode
    /**
     * Get info about vscode
     *
     * @returns route
     */
    vscodeInfo: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/vscode/info'
        ]
    },
    /**
     * Get info about vscode
     *
     * @returns route
     */
    vscodeExtensionsList: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/vscode/extensions/list'
        ]
    },
    /**
     * Install extension
     *
     * @returns route
     */
    vscodeExtensionInstall: function(extension) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/vscode/extensions/install'.argUri({
                extension: extension,
            })
        ]
    },
    /**
     * Update settings
     *
     * @returns route
     */
    vscodeUpdateSettings: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/vscode/settings/update'
        ]
    },
    //////////////////////////////////////////
    // SDK
    /**
     * Get installed Aurora SDK
     *
     * @returns route
     */
    sdkInstalled: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/sdk/installed'
        ]
    },
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
    /**
     * Remove package
     *
     * @returns route
     */
    emulatorPackageRemove: function(package_name, apm) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/emulator/package/remove'.argUri({
                package: package_name,
                apm: apm,
            })
        ]
    },
    /**
     * Run package
     *
     * @returns route
     */
    emulatorPackageRun: function(package_name) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/emulator/package/run'.argUri({
                package: package_name,
            })
        ]
    },
    /**
     * Install package
     *
     * @returns route
     */
    emulatorPackageInstall: function(path, apm) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/emulator/package/install'.argUri({
                path: path,
                apm: apm,
            })
        ]
    },
    /**
     * Upload file
     *
     * @returns route
     */
    emulatorUpload: function(path) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/emulator/upload'.argUri({
                path: path,
            })
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
     * Remove package
     *
     * @returns route
     */
    devicePackageRemove: function(host, package_name, apm) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/device/package/remove'.argUri({
                host: host,
                package: package_name,
                apm: apm,
            })
        ]
    },
    /**
     * Run package
     *
     * @returns route
     */
    devicePackageRun: function(host, package_name) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/device/package/run'.argUri({
                host: host,
                package: package_name,
            })
        ]
    },
    /**
     * Install package
     *
     * @returns route
     */
    devicePackageInstall: function(host, path, apm) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/device/package/install'.argUri({
                host: host,
                path: path,
                apm: apm,
            })
        ]
    },
    /**
     * Upload file
     *
     * @returns route
     */
    deviceUpload: function(host, path) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/device/upload'.argUri({
                host: host,
                path: path,
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
    // App
    /**
     * Get information about the application.
     *
     * @returns route
     */
    appInfo: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/app/info'
        ]
    },
    /**
     * Get information about versions the application.
     *
     * @returns route
     */
    appVersions: function() {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route", '/app/versions'
        ]
    },
    /**
     * Check auth to app
     *
     * @returns route
     */
    appAuthCheck: function(version = undefined) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            version ? '/app/auth/check'.argUri({version: version}) : '/app/auth/check'
        ]
    },
    /**
     * Auth to root shell
     *
     * @returns route
     */
    appAuthRoot: function(password) {
        return [
            ...AppConstants.AuroraCLI, 'api', "--route",
            '/app/auth/root'.argUri({
                password: password,
            })
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
