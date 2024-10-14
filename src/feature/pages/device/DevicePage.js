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

const DevicePageStates = Object.freeze({
	LOADING:	1,
	EMPTY:		2,
	DONE:		3,
});

export const DevicePage = GObject.registerClass({
	GTypeName: 'AtbDevicePage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/device/DevicePage.ui',
	InternalChildren: [
		'IdDeviceBoxPage',
		'IdPreferencesPage',
		'IdDeviceInfoGroup',
		'IdDeviceInfo',
		'IdDeviceLoading',
		'IdDeviceEmpty',
		'IdPageRefresh',
	],
}, class extends Adw.NavigationPage {
	#window
	#params

	constructor(params) {
		super(params);
		this.tag = this.utils.constants.Pages.DevicePage;
		this.#actionsConnect();
	}

	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
	}

	vfunc_map() {
		super.vfunc_map();
		this.#params = this.#window.navigation().params(this.utils.constants.Pages.DevicePage);
		this.#initData();
	}

	#refresh() {
		this.#initData();
	}

	#statePage(state) {
		this.childrenHide(
			'IdPreferencesPage',
			'IdDeviceLoading',
			'IdDeviceEmpty',
			'IdPageRefresh',
		);
		if (state == DevicePageStates.LOADING) {
			this._IdDeviceBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdDeviceLoading');
		}
		if (state == DevicePageStates.EMPTY) {
			this._IdDeviceBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdDeviceEmpty');
		}
		if (state == DevicePageStates.DONE) {
			this._IdDeviceBoxPage.valign = Gtk.Align.TOP;
			return this.childrenShow('IdPreferencesPage', 'IdPageRefresh');
		}
	}

	#initData() {
		this.#statePage(DevicePageStates.LOADING);
		this.utils.helper.getPromisePage(async () => {
			return this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.deviceInfo(this.#params.host))
			);
		}).then((response) => {
			try {
				if (response && response.code === 200) {
					this.#initPage(response.value);
					this.#statePage(DevicePageStates.DONE);
				} else {
					this.#statePage(DevicePageStates.EMPTY);
					this.utils.log.error(response)
				}
			} catch(e) {
				this.#statePage(DevicePageStates.EMPTY);
				this.utils.log.error(response)
			}
		});
	}

	#initPage(info) {
		this._IdDeviceInfo.icon = 'aurora-toolbox-device';
		this._IdDeviceInfo.title = info.PRETTY_NAME;
		this._IdDeviceInfo.subtitle = info.ARCH;
	}

	#actionsConnect() {
		this.connectGroup('DeviceTool', {
            'terminal': () => {
				this.connectors.exec
					.communicateAsync(this.connectors.shell.gnomeTerminalOpen(
						`ssh ${this.#params.user}@${this.#params.host} -p ${this.#params.port}`
					))
					.catch((e) => console.log(e));
			},
			// @todo
            'install': () => console.log('install'),
            'remove': () => console.log('remove'),
            'run': () => console.log('run'),
            'upload': () => console.log('upload'),
        });
		this._IdPageRefresh.connect('clicked', () => this.#refresh());
	}
});
