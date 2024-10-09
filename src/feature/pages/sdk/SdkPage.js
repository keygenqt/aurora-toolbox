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

const SdkPageStates = Object.freeze({
	LOADING:	1,
	EMPTY:		2,
	DONE:		3,
});

export const SdkPage = GObject.registerClass({
	GTypeName: 'AtbSdkPage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/sdk/SdkPage.ui',
	InternalChildren: [
		'IdSdkBoxPage',
		'IdPreferencesPage',
		'IdSdkInfoGroup',
		'IdSdkInfo',
		'IdSdkLoading',
		'IdSdkEmpty',
		'IdPageRefresh',
	],
}, class extends Adw.NavigationPage {
	#tools

	// Start
	constructor(params) {
		super(params);
		this.tag = AppConstants.Pages.SdkPage;
		this.#actionsConnect();
		this.#initData();
	}

	#refresh() {
		this.#initData();
	}

	#statePage(state) {
		if (state == SdkPageStates.LOADING) {
			this._IdSdkBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdSdkLoading.visible = true;
			this._IdSdkEmpty.visible = false;
			this._IdPageRefresh.visible = false;
			return
		}
		if (state == SdkPageStates.EMPTY) {
			this._IdSdkBoxPage.valign = Gtk.Align.CENTER;
			this._IdPreferencesPage.visible = false;
			this._IdSdkLoading.visible = false;
			this._IdSdkEmpty.visible = true;
			this._IdPageRefresh.visible = true;
			return
		}
		if (state == SdkPageStates.DONE) {
			this._IdSdkBoxPage.valign = Gtk.Align.TOP;
			this._IdPreferencesPage.visible = true;
			this._IdSdkLoading.visible = false;
			this._IdSdkEmpty.visible = false;
			this._IdPageRefresh.visible = true;
			return
		}
	}

	#initData() {
		this.#statePage(SdkPageStates.LOADING);
		ShellExec.communicateAsync(AuroraAPI.sdkInstalled())
			.catch((e) => Log.error(e))
			.then(async (response) => {
				const responseData = Array.isArray(response) ? response.slice(-1)[0] : response;
				if (responseData && responseData.code === 200) {
					this.#initPage(responseData.value);
					this.#statePage(SdkPageStates.DONE);
				} else {
					this.#statePage(DevicesPageStates.EMPTY);
					Log.error(responseData)
				}
			});
	}

	#initPage(info) {
		this.#tools = info.tools[0];
		this._IdSdkInfo.icon = 'aurora-toolbox-sdk';
		this._IdSdkInfo.name = _('Aurora SDK');
		this._IdSdkInfo.arch = info.versions[0];
	}

	#actionsConnect() {
		this._IdPageRefresh.connect('clicked', () => {
			this._IdPageRefresh.visible = false;
			this.#refresh();
		});
		this.connectGroup('SdkTool', {
			'maintenance': () => ShellExec.communicateAsync([this.#tools]),
		});
	}
});
