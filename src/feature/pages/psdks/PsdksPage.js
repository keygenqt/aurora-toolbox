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
import Gtk from 'gi://Gtk';

import { AppConstants } from '../../../base/constants/AppConstants.js';
import { ShellExec } from '../../../base/connectors/ShellExec.js';
import { AuroraAPI } from '../../../base/connectors/AuroraAPI.js';
import { Log } from '../../../base/utils/Log.js';

import { AlertDialog } from '../../dialogs/AlertDialog.js';

const PsdksPageStates = Object.freeze({
	LOADING:	1,
	ERROR:		2,
	DONE:		3,
});

export const PsdksPage = GObject.registerClass({
	GTypeName: 'AtbPsdksPage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/psdks/PsdksPage.ui',
	InternalChildren: [
		'IdPageContent',
		'IdInstalledGroup',
		'IdAvailableGroup',
		'IdPreferencesPage',
		'IdLoading',
		'IdError',
		'IdPageRefresh',
	],
}, class extends Adw.NavigationPage {
	#window
	#installed = []
	#available = []
	#installedWidgets = []
	#availableWidgets = []

	constructor(params) {
		super(params);
		this.tag = AppConstants.Pages.PsdksPage;
		this.#initData();
		this.#initActions();
	}

	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
	}

	#refresh() {
		this.#initData();
	}

	#clear() {
		for (let step = 0; step < this.#installedWidgets.length; step++) {
			this._IdInstalledGroup.remove(this.#installedWidgets[step]);
		}
		for (let step = 0; step < this.#availableWidgets.length; step++) {
			this._IdAvailableGroup.remove(this.#availableWidgets[step]);
		}
		this.#installed = [];
		this.#available = [];
		this.#installedWidgets = [];
		this.#availableWidgets = [];
	}

	#statePage(state) {
		if (state == PsdksPageStates.LOADING) {
			this._IdPageContent.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdLoading.visible = true;
			this._IdError.visible = false;
			this._IdPageRefresh.visible = false;
			return
		}
		if (state == PsdksPageStates.ERROR) {
			this._IdPageContent.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdLoading.visible = false;
			this._IdError.visible = true;
			this._IdPageRefresh.visible = true;
			return
		}
		if (state == PsdksPageStates.DONE) {
			this._IdPageContent.valign = Gtk.Align.TOP;
			this._IdPreferencesPage.visible = true;
			this._IdLoading.visible = false;
			this._IdError.visible = false;
			this._IdPageRefresh.visible = true;
			// Show groups
			this._IdInstalledGroup.visible = this.#installed.length != 0;
			this._IdAvailableGroup.visible = this.#available.length != 0;
			return
		}
	}

	#initActions() {
		this._IdPageRefresh.connect('clicked', () => {
			this.#refresh();
		});
	}

	#initData() {
		this.#clear();
		this.#statePage(PsdksPageStates.LOADING);
        new Promise(async (resolve, reject) => {
            try {
                const response0 = await ShellExec.communicateAsync(AuroraAPI.psdkInstalled());
				const response1 = Array.isArray(response0) ? response0.slice(-1)[0] : response0;
                const installed = response1 && response1.code === 200 ? response1.value.versions : [];
                const iVersions = installed.map((v) => v.split('.').slice(0, -1).join('.'));

                const response2 = await ShellExec.communicateAsync(AuroraAPI.psdkAvailable());
                const available = response2 && response2.code === 200 ? response2.value : [];
				resolve({
					'installed': installed,
					'available': available.filter((v) => !iVersions.includes(v)),
				});
            } catch (e) {
                reject(e)
            }
        })
			.catch((e) => Log.error(e))
			.then(async (response) => {
				if (response.available.length !== 0) {
					this.#installed = response.installed;
					this.#available = response.available;
					this.#initInstalledGroup();
					this.#initAvailableGroup();
					this.#statePage(PsdksPageStates.DONE);
				} else {
					this.#statePage(PsdksPageStates.ERROR);
					Log.error(response)
				}
			});
	}

	#initInstalledGroup() {
		this.#installed.forEach((version) => {
			const widget = this.#createItem(version, 'go-next', () => {
				this.#window.navigation().push(AppConstants.Pages.PsdkPage, {
					version: version
				});
			});
			// Add to active group
			this._IdInstalledGroup.add(widget);
			// Save widget
			this.#installedWidgets.push(widget);
		});
	}

	#initAvailableGroup() {
		this.#available.forEach((version) => {
			const widget = this.#createItem(version, 'system-software-install-symbolic', () => {
				new AlertDialog().present(
					this.#window,
					_('Install'),
					_(`Do you want install "${version}" PSDK?`),
					() => {
						console.log(`Install dialog: ${version}`);
					}
				);
			});
			// Add to active group
			this._IdAvailableGroup.add(widget);
			// Save widget
			this.#availableWidgets.push(widget);
		});
	}

	#createItem(
		version,
		icon,
		callback,
	) {
		// Create action
		const actions = {};
		const group = `group-${version.replaceAll('.', '_')}`;
		const action = `action-${version.replaceAll('.', '_')}`;
		// Create widget
		const actionRow = new Adw.ActionRow({
			'title': _(`Version: ${version}`),
			'action-name': `${group}.${action}`,
		});
		if (callback !== undefined) {
			// If action add icon
			actionRow.add_suffix(new Gtk.Image({
				'icon-name': icon,
			}));
			// Activatable on yourself
			actionRow.set_activatable_widget(actionRow);
			// Add object action
			actions[action] = callback
			// Activate action
			actionRow.connectGroup(group, actions);
		}
		return actionRow;
	}
});
