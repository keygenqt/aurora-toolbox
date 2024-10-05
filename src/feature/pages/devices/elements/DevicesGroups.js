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

export const DevicesGroups = GObject.registerClass({
	GTypeName: 'AtbDevicesGroups',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/devices/elements/DevicesGroups.ui',
	InternalChildren: [
		'IdDevicesActiveGroup',
		'IdDevicesNonActiveGroup',
	],
	Signals: {
		'navigation-push': {
			param_types: [GObject.TYPE_STRING]
		},
	},
}, class extends Gtk.Box {
	constructor(params) {
		super(params);
		this.#initDevices();
	}

	#initDevices() {
		// @todo
		// Not sate non active
		this._IdDevicesNonActiveGroup.visible = false;

		// @todo
		// Demo ids devices
		const idsDevices = [22, 23, 24, 25];
		const actions = {};

		// @todo
		// Set demo active
		idsDevices.forEach((id) => {
			// Create action
			const action = `action-${id}`;
			// Init widget
			var device = new Adw.ActionRow({
				// id: 'test',
				title: 'Device: 192.168.1.45',
				subtitle: `Id: ${id}`,
				'action-name': `Devices.${action}`
			});
			device.add_suffix(new Gtk.Image({
				'icon-name': 'go-next',
			}));
			device.set_activatable_widget(device);
			// Add to list
			this._IdDevicesActiveGroup.add(device);
			// Add callback
			actions[action] = () => {
				this.emit('navigation-push', 'page-device');
			}
		});
		// Init actions
		this.connectGroup('Devices', actions);
	}
});
