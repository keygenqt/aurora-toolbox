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

const FlutterPageStates = Object.freeze({
	LOADING:	1,
	ERROR:		2,
	DONE:		3,
});

export const FlutterPage = GObject.registerClass({
	GTypeName: 'AtbFlutterPage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/flutter/FlutterPage.ui',
	InternalChildren: [
		'IdPageContent',
		'IdInstalledGroup',
		'IdAvailableGroup',
		'IdPreferencesPage',
		'IdLoading',
		'IdError',
		'IdPageAbout',
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
		this.tag = this.utils.constants.Pages.FlutterPage;
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
		this.childrenHide(
			'IdPreferencesPage',
			'IdLoading',
			'IdError',
			'IdPageRefresh',
		);
		if (state == FlutterPageStates.LOADING) {
			this._IdPageContent.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdLoading');
		}
		if (state == FlutterPageStates.ERROR) {
			this._IdPageContent.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdError', 'IdPageRefresh');
		}
		if (state == FlutterPageStates.DONE) {
			this._IdPageContent.valign = Gtk.Align.TOP;
			this.childrenShow('IdPreferencesPage', 'IdPageRefresh');
			// Show groups
			this._IdInstalledGroup.visible = this.#installed.length != 0;
			this._IdAvailableGroup.visible = this.#available.length != 0;
			return
		}
	}

	#initActions() {
		this._IdPageAbout.connect('clicked', () => {
			this.utils.helper.uriLaunch(this.#window, this.utils.constants.Docs.flutter);
		});
		this._IdPageRefresh.connect('clicked', () => {
			this.#refresh();
		});
	}

	#initData() {
		this.#clear();
		this.#statePage(FlutterPageStates.LOADING);
		this.utils.helper.getPromisePage(async () => {
			const installed = this.utils.helper.getValueResponse(this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.flutterInstalled())
			), 'versions', []);
			const available = this.utils.helper.getValueResponse(this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.flutterAvailable())
			), 'value', []);
			return {
				'installed': installed,
				'available': available.filter((v) => !installed.includes(v)),
			}
		}).then((response) => {
			try {
				if (response.available.length !== 0) {
					this.#installed = response.installed;
					this.#available = response.available;
					this.#initInstalledGroup();
					this.#initAvailableGroup();
					this.#statePage(FlutterPageStates.DONE);
				} else {
					this.#statePage(FlutterPageStates.ERROR);
					this.utils.log.error(response);
				}
			} catch(e) {
				this.#statePage(FlutterPageStates.ERROR);
				this.utils.log.error(response);
			}
		});
	}

	#initInstalledGroup() {
		this.#installed.forEach((version) => {
			const widget = this.#createItem(version, 'edit-delete-symbolic', () => {
				new AlertDialog().present(
					this.#window,
					_('Remove'),
					_(`Do you want remove "${version}" Flutter SDK?`),
					() => {
						console.log(`Remove dialog: ${version}`);
					}
				);
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
					_(`Do you want install "${version}" Flutter SDK?`),
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
