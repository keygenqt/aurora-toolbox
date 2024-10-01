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
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

import { AppConstants } from '../base/constants/AppConstants.js';
import { DBusProxy } from '../base/connectors/DBusProxy.js';
import { Log } from '../base/utils/Log.js';
import { Helper } from '../base/utils/Helper.js';
import { ShellExec } from '../base/connectors/ShellExec.js';
import { AuroraAPI } from '../base/connectors/AuroraAPI.js';

import { AboutDialog } from './dialogs/AboutDialog.js';
import { SettingsDialog } from './dialogs/SettingsDialog.js';

// Import class for UI
import './widgets/WelcomeWidget.js';

export const Window = GObject.registerClass({
	GTypeName: 'AtbWindow',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/Window.ui',
}, class extends Adw.ApplicationWindow {
	#dbusProxy = new DBusProxy();

	constructor(params={}) {
		super(params);

		this.#dbusConnect();
		this.#actionsConnect();
		this.#bindSettings();
	}

	vfunc_close_request() {
		super.vfunc_close_request();
		this.run_dispose();
	}

	#bindSettings() {
		settings.bind('window-width', this, 'default-width', Gio.SettingsBindFlags.DEFAULT);
		settings.bind('window-height', this, 'default-height', Gio.SettingsBindFlags.DEFAULT);
	}

	#dbusConnect() {
		this.#dbusProxy.connectWithEmit('colorScheme', (value) => {
			this.#changeAppearanceCss(value);
		});
	}

	#actionsConnect() {
		this.connectGroup('AtbWindow', {
            'about': () => {
				// Run about dialog
				new AboutDialog().present(this);
			},
            'settings': () => {
				// Run settings dialog
				new SettingsDialog().present(this);
			},
            'documentation': () => {
				// Open url with documentation
				Helper.uriLaunch(this, AppConstants.App.documentation);
			},
            'configuration': () => {
				// Get path from Aurora CLI
				ShellExec.communicateAsync(AuroraAPI.configurationPath())
					.catch((e) => Log.error(e))
					.then((response) => {
						// Open path in editor
						if (response && response.code === 200) {
							Helper.fileOpen(response.value);
						} else {
							Log.error('Error get path to configuration file.');
						}
					});
			},
        });
	}

	#changeAppearanceCss(colorScheme = 0) {
		if (colorScheme === 1) {
			this.add_css_class('is-dark');
			this.remove_css_class('is-light');
		} else {
			this.add_css_class('is-light');
			this.remove_css_class('is-dark');
		}
	}
});
