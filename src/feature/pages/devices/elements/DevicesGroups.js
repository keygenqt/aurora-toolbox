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
import Adw from 'gi://Adw';

import { AppConstants } from '../../../../base/constants/AppConstants.js';
import { ShellExec } from '../../../../base/connectors/ShellExec.js';
import { AuroraAPI } from '../../../../base/connectors/AuroraAPI.js';
import { Log } from '../../../../base/utils/Log.js';

const DevicesGroupsStates = Object.freeze({
	LOADING:	1,
	EMPTY:		2,
	DONE:		3,
});

export const DevicesGroups = GObject.registerClass({
	GTypeName: 'AtbDevicesGroups',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/devices/elements/DevicesGroups.ui',
	InternalChildren: [
		'IdDevicesActiveGroup',
		'IdDevicesNonActiveGroup',
		'IdDevicesLoading',
		'IdPreferencesPage',
		'IdDevicesEmpty',
	],
}, class extends Gtk.Box {
	#window
	#devices = []
	#widgets = []

	constructor(params) {
		super(params);
		this.#initDevices();

	}

	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
	}

	#statePage(state) {
		if (state == DevicesGroupsStates.LOADING) {
			this.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdDevicesLoading.visible = true;
			this._IdDevicesEmpty.visible = false;
			return
		}
		if (state == DevicesGroupsStates.EMPTY) {
			this.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdDevicesLoading.visible = false;
			this._IdDevicesEmpty.visible = true;
			return
		}
		if (state == DevicesGroupsStates.DONE) {
			this.valign = Gtk.Align.TOP;
			this._IdPreferencesPage.visible = true;
			this._IdDevicesLoading.visible = false;
			this._IdDevicesEmpty.visible = false;
			this._IdDevicesActiveGroup.visible = this.#devices.filter((d) => d.active).length != 0;
			this._IdDevicesNonActiveGroup.visible = this.#devices.filter((d) => !d.active).length != 0;
			return
		}
	}

	#initDevices() {
		this.#statePage(DevicesGroupsStates.LOADING);
		ShellExec.communicateAsync(AuroraAPI.deviceList())
			.catch((e) => Log.error(e))
			.then(async (response) => {
				if (response && response.code === 200) {
					this.#getListDevices(response.value);
				} else {
					this.#statePage(DevicesGroupsStates.EMPTY);
					Log.error(response)
				}
			});
	}

	#getListDevices(config) {
		for (const index in config) {
			ShellExec.communicateAsync(AuroraAPI.deviceCommand(config[index]['host'], 'ls'))
				.catch((e) => Log.error(e))
				.then(async (response) => {
					config[index]['active'] = !Array.isArray(response) && response.code === 200;
					this.#addDeviceGroup(config[index]);
					this.#devices.push(config[index]);
					this.#statePage(DevicesGroupsStates.DONE);
				});
		}
	}

	#addDeviceGroup(device) {
		// Create action
		const actions = {};
		const group = `group-${device.host.replaceAll('.', '_')}`;
		const action = `action-${device.host.replaceAll('.', '_')}`;
		// Create widget
		const actionRow = new Adw.ActionRow({
			'title': `${device.host}:${device.port}`,
			'subtitle': device.auth.includes('.ssh') ? _('Auth: SSH key') : _('Auth: Password'),
			'action-name': `${group}.${action}`
		});
		if (device.active) {
			// If action add icon
			actionRow.add_suffix(new Gtk.Image({
				'icon-name': 'go-next',
			}));
			// Activatable on yourself
			actionRow.set_activatable_widget(actionRow);
			// Add object action
			actions[action] = () => {
				this.#window.navigation().push(AppConstants.Pages.DevicePage, device);
			}
			// Activate action
			actionRow.connectGroup(group, actions);
			// Add to active group
			this._IdDevicesActiveGroup.add(actionRow);
		} else {
			// Add to non active group
			this._IdDevicesNonActiveGroup.add(actionRow);
		}
	}
});
