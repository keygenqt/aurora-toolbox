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
		this.tag = this.utils.constants.Pages.SdkPage;
		this.#actionsConnect();
		this.#initData();
	}

	#refresh() {
		this.#initData();
	}

	#statePage(state) {
		this.childrenHide(
			'IdPreferencesPage',
			'IdSdkLoading',
			'IdSdkEmpty',
			'IdPageRefresh',
		);
		if (state == SdkPageStates.LOADING) {
			this._IdSdkBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdSdkLoading');
		}
		if (state == SdkPageStates.EMPTY) {
			this._IdSdkBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdSdkEmpty', 'IdPageRefresh');
		}
		if (state == SdkPageStates.DONE) {
			this._IdSdkBoxPage.valign = Gtk.Align.TOP;
			return this.childrenShow('IdPreferencesPage', 'IdPageRefresh');
		}
	}

	#initData() {
		this.#statePage(SdkPageStates.LOADING);
		this.utils.helper.getPromisePage(async () => {
			return this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.sdkInstalled())
			);
		}).then((response) => {
			try {
				if (response && response.code === 200) {
					this.#initPage(response.value);
					this.#statePage(SdkPageStates.DONE);
				} else {
					this.#statePage(DevicesPageStates.EMPTY);
					this.utils.log.error(response);
				}
			} catch(e) {
				this.#statePage(DevicesPageStates.EMPTY);
				this.utils.log.error(response);
			}
		});
	}

	#initPage(info) {
		this.#tools = info.tools[0];
		this._IdSdkInfo.icon = 'aurora-toolbox-sdk';
		this._IdSdkInfo.title = _('Aurora SDK');
		this._IdSdkInfo.subtitle = info.versions[0];
	}

	#actionsConnect() {
		this._IdPageRefresh.connect('clicked', () => {
			this._IdPageRefresh.visible = false;
			this.#refresh();
		});
		this.connectGroup('SdkTool', {
			'maintenance': () => this.connectors.exec.communicateAsync([this.#tools]),
		});
	}
});
