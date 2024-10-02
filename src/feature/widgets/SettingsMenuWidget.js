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

import { AppConstants } from '../../base/constants/AppConstants.js';
import { Log } from '../../base/utils/Log.js';
import { Helper } from '../../base/utils/Helper.js';
import { ShellExec } from '../../base/connectors/ShellExec.js';
import { AuroraAPI } from '../../base/connectors/AuroraAPI.js';

import { AboutDialog } from '../dialogs/AboutDialog.js';
import { SettingsDialog } from '../dialogs/SettingsDialog.js';

export const SettingsMenuWidget = GObject.registerClass({
	GTypeName: 'AtbSettingsMenuWidget',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/widgets/SettingsMenuWidget.ui',
}, class extends Gtk.MenuButton {

	constructor(params) {
		super(params);
		this.#actionsConnect();
	}

	#actionsConnect() {
		this.connectGroup('SettingsMenu', {
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
				Helper.uriLaunch(this.get_native(), AppConstants.App.documentation);
			},
            'configuration': () => {
				// Get path from Aurora CLI
				ShellExec.communicateAsync(AuroraAPI.infoPathConfiguration())
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
});
