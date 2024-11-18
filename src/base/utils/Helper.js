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
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';

import { Log } from './Log.js';
import { AuroraAPI } from '../connectors/AuroraAPI.js';
import { ShellAPI } from '../connectors/ShellAPI.js';
import { ShellExec } from '../connectors/ShellExec.js';
import { AppConstants } from '../constants/AppConstants.js';

export const Helper = {
    /**
     * Open url
     *
     * @param {Gtk.Window} window - Parent windows
     * @param {String} url - String url
     */
    uriLaunch: function (window, url) {
        const launcher = new Gtk.UriLauncher();
        launcher.uri = url;
        launcher.launch(window, null, (launcher, res) => {
            try {
                launcher.launch_finish(res);
            } catch (err) {
                Log.error(err);
            }
        });
    },
    /**
     * Open edit file
     *
     * @param {Gtk.Window} window - Parent windows
     * @param {String} path - String path to file
     */
    fileOpen: function (path) {
        ShellExec.communicateAsync(ShellAPI.gnomeTextEditorVersion())
            .then(() => {
                ShellExec.communicateAsync(ShellAPI.gnomeTextEditorOpen(path));
            })
            .catch(() => {
                ShellExec.communicateAsync(ShellAPI.xdgOpen(path));
            })
    },
    /**
     * Get settings language
     */
    getLanguageAPI: function() {
        const settings = ShellExec.communicateSync(AuroraAPI.settingsList());
        if (settings && settings.value?.language === 'ru') {
            return AppConstants.Language.ru;
        }
        return AppConstants.Language.en;
    },
    /**
     * Get settings hint
     */
    getHintAPI: function() {
        const settings = ShellExec.communicateSync(AuroraAPI.settingsList());
        if (settings && settings.value?.hint === 'false') {
            return false;
        }
        return true;
    },
    /**
     * Check system is Ubuntu
     */
    isUbuntuSystem: function() {
        return false;
        // @todo add install aurora-cli for Ubuntu
        // return GLib.getenv('DESKTOP_SESSION') === 'ubuntu'
    },
    /**
     * Get environment language
     */
    getLanguageENV: function() {
        return GLib.getenv('LANG') ?? AppConstants.Language.en;
    },
    /**
     * Set language
     */
    setLanguage: function(language) {
        GLib.setenv('LANG', language, true);
    },
    /**
     * Get environment mode
     */
    getThemeMode: function() {
        const scheme = GLib.getenv('ADW_DEBUG_COLOR_SCHEME') ?? 'auto';
        if (scheme == 'prefer-light') {
            return 1;
        }
        if (scheme == 'prefer-dark') {
            return 2;
        }
        return 0;
    },
    /**
     * Set mode: light(1) / dark(2)
     */
    setThemeMode: function(mode) {
        if (mode == 1) {
            GLib.setenv('ADW_DEBUG_COLOR_SCHEME', `prefer-light`, true);
        }
        if (mode == 2) {
            GLib.setenv('ADW_DEBUG_COLOR_SCHEME', `prefer-dark`, true);
        }
    },
    /**
     * Create params widget
     */
    makeParams: function(data) {
        return Object.fromEntries(Object.entries(data).map(([key, type]) => {
            var flags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;
            if (type == 'string') {
                return [key, GObject.ParamSpec.string(key, key, key, flags, '')];
            } else if (type == 'boolean') {
                return [key, GObject.ParamSpec.boolean(key, key, key, flags, false)];
            } else if (type == 'double') {
                return [key, GObject.ParamSpec.double(key, key, key, flags, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0)];
            } else if (type == 'int') {
                return [key, GObject.ParamSpec.int(key, key, key, flags, GLib.MININT32, GLib.MAXINT32, 0)];
            } else if (type == 'uint') {
                return [key, GObject.ParamSpec.uint(key, key, key, flags, 0, GLib.MAXUINT32, 0)];
            } else if (type == 'object') {
                return [key, GObject.ParamSpec.object(key, key, key, flags, GObject.Object.$gtype, null)];
            } else {
                return [key, null];
            }
        }).filter((p) => p[1] !== null));
    },
    /**
     * Get latest object from array or get just object
     */
    getLastObject: function (response) {
        if (!Boolean(response)) {
            return response;
        }
        return Array.isArray(response) ? response.slice(-1)[0] : response;
    },
    /**
     * Loading multiple query
     */
    getObjectAsync: async function (query, valid, logging = false) {
        var result1 = undefined;
        var result2 = undefined;
        async function loadResult() {
            await new Promise(r => setTimeout(r, 100));
            if (result1 !== undefined && result2 !== result1) {
                result2 = result1;
                if (valid(result2)) {
                    return result2;
                } else {
                    return await loadResult();
                }
            } else {
                return await loadResult();
            }
        }
        ShellExec.communicateCallback(
            query,
            (object) => {
                result1 = object;
                if (logging) {
                    Log.log(object);
                }
            },
            () => result1 = {code: 500, message: 'Error get object.'}
        );
        return await loadResult();
    },
    /**
     * Get value is success response or default
     */
    getValueResponse: function (response, key, value = undefined) {
        if (!Boolean(response)) {
            return value;
        }
        if (key == 'value') {
            return response && response.code === 200 ? response.value : value;
        } else {
            return response && response.code === 200 ? response.value[key] : value;
        }
    },
    /**
     * Create Promise for page queries
     */
    getPromisePage: function(body) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await body());
            } catch (e) {
                reject(e);
            }
        });
    },
    /**
     * Check gnome terminal
     */
    isExistGnomeTerminal: async function() {
		try {
			const output = await ShellExec.communicateAsync(ShellAPI.gnomeTerminalVersion());
			return output.filter((line) => line.includes('GNOME Terminal')).length === 1;
		} catch (e) {
			return false;
		}
	},
    /**
     * Close dialog with timeout
     */
    closeAsyncDialog: async function (dialog) {
        const times = [0, 2, 5, 10, 50, 100];
        for (const time of times) {
            await new Promise(r => setTimeout(r, time));
            dialog.close();
        }
    },
    /**
     * Http query
     */
    httpRequest(url) {
        return new Promise((resolve, reject) => {

            if (Soup.MAJOR_VERSION === 3) {
                let session = new Soup.Session();
                session.set_timeout(5);
                session.set_user_agent('aurora-toolbox');
                let message = Soup.Message.new('GET', url);
                    session.send_and_read_async(
                        message,
                        GLib.PRIORITY_DEFAULT,
                        null,
                        function (session, result) {
                            try {
                                if (message.get_status() === Soup.Status.OK) {
                                    let bytes = session.send_and_read_finish(result);
                                    let decoder = new TextDecoder('utf-8');
                                    let response = decoder.decode(bytes.get_data());
                                    resolve({
                                        code: result.status_code,
                                        body: response,
                                    });
                                } else {
                                    resolve({
                                        code: message.get_status() === 0 ? 500 : message.get_status(),
                                    })
                                }
                            } catch (e) {
                                resolve({ code: 500 })
                            }
                        });
            } else {
                resolve({ code: 500 })
            }
        });
    }
}
