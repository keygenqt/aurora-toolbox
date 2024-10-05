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
import Adw from 'gi://Adw';

import { Log } from '../../../base/utils/Log.js';
import { Helper } from '../../../base/utils/Helper.js';
import { ShellExec } from '../../../base/connectors/ShellExec.js';
import { AuroraAPI } from '../../../base/connectors/AuroraAPI.js';

import { AppConstants } from '../../../base/constants/AppConstants.js';

import './elements/ToolsGroups.js';
import './elements/ToolsMenu.js';

export const ToolsPage = GObject.registerClass({
	GTypeName: 'AtbToolsPage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/tools/ToolsPage.ui',
	InternalChildren: [],
}, class extends Adw.NavigationPage {
	constructor(params) {
		super(params);
		// Set tag page
		this.tag = AppConstants.Pages.ToolsPage;
		// Init first open
		settings.set_boolean('first-open', true);
		// Init connections
		this.#actionsConnect();
	}

	#actionsConnect() {
		this.connectGroup('AuroraCLI', {
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
