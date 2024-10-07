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
		'IdGroupInstallRPM',
	],
}, class extends Adw.NavigationPage {
	#window
	#params

	// Start
	constructor(params) {
		super(params);
		this.tag = AppConstants.Pages.DevicePage;
		this.#actionsConnect();
	}

	// Create
	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
	}

	// Open
	vfunc_map() {
		super.vfunc_map();
		this.#params = this.#window.navigation().params(AppConstants.Pages.DevicePage);
		this.#initData();
	}

	#refresh() {
		this.#initData();
	}

	#statePage(state) {
		if (state == DevicePageStates.LOADING) {
			this._IdDeviceBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdDeviceLoading.visible = true;
			this._IdDeviceEmpty.visible = false;
			this._IdPageRefresh.visible = false;
			return
		}
		if (state == DevicePageStates.EMPTY) {
			this._IdDeviceBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdDeviceLoading.visible = false;
			this._IdDeviceEmpty.visible = true;
			this._IdPageRefresh.visible = false;
			return
		}
		if (state == DevicePageStates.DONE) {
			this._IdDeviceBoxPage.valign = Gtk.Align.TOP;
			this._IdPreferencesPage.visible = true;
			this._IdDeviceLoading.visible = false;
			this._IdDeviceEmpty.visible = false;
			this._IdPageRefresh.visible = true;
			return
		}
	}

	#initData() {
		this.#statePage(DevicePageStates.LOADING);
		ShellExec.communicateAsync(AuroraAPI.deviceInfo(this.#params.host))
			.catch((e) => Log.error(e))
			.then(async (response) => {
				if (response && response.code === 200) {
					this.#initPage(response.value);
					this.#statePage(DevicePageStates.DONE);
				} else {
					this.#statePage(DevicePageStates.EMPTY);
					Log.error(response)
				}
			});
	}

	#initPage(info) {
		this._IdDeviceInfo.icon = 'aurora-toolbox-device';
		this._IdDeviceInfo.name = info.PRETTY_NAME;
		this._IdDeviceInfo.arch = info.ARCH;
	}

	#actionsConnect() {
		// @todo
		this.connectGroup('DeviceTool', {
            'install': () => {
				console.log('Install')
			},
			'upload': () => {
				console.log('Upload')
			}
        });
		this._IdPageRefresh.connect('clicked', () => {
			this._IdPageRefresh.visible = false;
			this.#refresh();
		});
	}
});
