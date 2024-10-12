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
		this.tag = this.utils.constants.Pages.ToolsPage;
		// Init connections
		this.#actionsConnect();
	}

	vfunc_map() {
		super.vfunc_map();
		settings.set_boolean('first-open', false);
	}

	#actionsConnect() {
		this.connectGroup('AuroraCLI', {
            'configuration': () => {
				// Get path from Aurora CLI
				this.connectors.exec.communicateAsync(this.connectors.aurora.appInfo())
					.catch((e) => this.utils.log.error(e))
					.then((response) => {
						// Open path in editor
						if (response && response.code === 200) {
							this.utils.helper.fileOpen(response.value.PATH_CONFIG);
						} else {
							this.utils.log.error('Error get path to configuration file.');
						}
					});
			},
        });
	}
});
