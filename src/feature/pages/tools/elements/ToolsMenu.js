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

import { AppConstants } from '../../../../base/constants/AppConstants.js';
import { Helper } from '../../../../base/utils/Helper.js';

import { AboutDialog } from '../../../dialogs/AboutDialog.js';
import { SettingsDialog } from '../../../dialogs/SettingsDialog.js';

export const ToolsMenu = GObject.registerClass({
	GTypeName: 'AtbToolsMenu',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/tools/elements/ToolsMenu.ui',
	InternalChildren: [],
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
        });
	}
});
