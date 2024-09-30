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
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';

import { Log } from './Log.js';
import { AuroraAPI } from '../connectors/AuroraAPI.js';
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
     * Get settings language
     */
    getLanguageAPI: function() {
        const settings = AuroraAPI.communicateSync(AuroraAPI.settingsList());
        if (settings.value?.language === 'ru') {
            return AppConstants.Language.ru
        }
        return AppConstants.Language.en;
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
}
