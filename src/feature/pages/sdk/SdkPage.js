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
import Gio from 'gi://Gio';

const SdkPageStates = Object.freeze({
	LOADING:		1,
	EMPTY:			2,
	DONE:			3,
	ERROR:			4,
	INSTALL_INFO:	5,
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
		'IdSdkError',
		'IdSdkInstallInfo',
		'IdPageAbout',
		'IdPageRefresh',
		'IdBanner',
	],
}, class extends Adw.NavigationPage {
	#window
	#tool
	#run

	constructor(params) {
		super(params);
		this.tag = this.utils.constants.Pages.SdkPage;
		this.#actionsConnect();
		this.#initData();
	}

	vfunc_realize() {
		super.vfunc_realize();
		this.#window = this.get_native();
	}

	#refresh() {
		this.#initData();
	}

	#statePage(state, message = undefined) {
		this.childrenHide(
			'IdPreferencesPage',
			'IdSdkLoading',
			'IdSdkEmpty',
			'IdSdkError',
			'IdSdkInstallInfo',
			'IdPageRefresh',
			'IdBanner'
		);
		if (state == SdkPageStates.LOADING) {
			this._IdSdkBoxPage.valign = Gtk.Align.CENTER;
			this._IdSdkLoading.showLoading(message);
			return this.childrenShow('IdSdkLoading');
		}
		if (state == SdkPageStates.EMPTY) {
			this._IdSdkBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdSdkEmpty', 'IdPageRefresh');
		}
		if (state == SdkPageStates.DONE) {
			this._IdSdkBoxPage.valign = Gtk.Align.TOP;
			if (this._IdBanner.revealed) {
				return this.childrenShow('IdPreferencesPage', 'IdPageRefresh', 'IdBanner');
			} else {
				return this.childrenShow('IdPreferencesPage', 'IdPageRefresh');
			}
		}
		if (state == SdkPageStates.ERROR) {
			this._IdSdkBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdSdkError', 'IdPageRefresh');
		}
		if (state == SdkPageStates.INSTALL_INFO) {
			this._IdSdkBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdSdkInstallInfo', 'IdPageRefresh');
		}
	}

	#initData() {
		this.#statePage(SdkPageStates.LOADING, _('Getting data...'));
		this.utils.helper.getPromisePage(async () => {
			// Clear cache
			await this.connectors.exec.communicateAsync(this.connectors.aurora.appClear());
			// Get info
			const result = this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.sdkInstalled())
			);
			const available = this.utils.helper.getValueResponse(this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.sdkAvailable())
			), 'value', []);
			// Check files
			if (result && result.code === 200 && result.value) {
				const tool = result.value.tools[0];
				const run = result.value.runs[0];
				if (!Boolean(tool) || !Boolean(run)
					|| !Gio.File.new_for_path(tool).query_exists(null) || !Gio.File.new_for_path(run).query_exists(null)
				) {
					return { code: 404 }
				}
			}
			return {
				code: result.code,
				value: result.value,
				latest: available.length > 0 ? available[0] : undefined,
			}
		}).then((response) => {
			try {
				if (response && response.code === 200) {
					this.#initPage(response.value, response.latest);
					this.#statePage(SdkPageStates.DONE);
				}
				else {
					this.#statePage(SdkPageStates.EMPTY);
				}
			} catch(e) {
				this.#statePage(SdkPageStates.EMPTY);
				this.utils.log.error(e);
			}
		});
	}

	#initPage(info, latestVersion) {
		this.#tool = info.tools[0];
		this.#run = info.runs[0];
		this._IdSdkInfo.icon = 'aurora-toolbox-sdk';
		this._IdSdkInfo.title = _('Aurora SDK');
		this._IdSdkInfo.subtitle = info.versions[0];
		this._IdBanner.revealed = info['versions'][0].split('-')[0] !== latestVersion;
	}

	#actionsConnect() {
		this._IdPageAbout.connect('clicked', () => {
			this.utils.helper.uriLaunch(this.#window, this.utils.constants.Docs.sdk);
		});
		this._IdPageRefresh.connect('clicked', () => {
			this._IdPageRefresh.visible = false;
			this.#refresh();
		});
		this._IdSdkEmpty.connect('button-clicked', () => {
			this.#downloadLatestAndRunInstall(true);
		});
		this._IdSdkEmpty.connect('button2-clicked', () => {
			this.#downloadLatestAndRunInstall(false);
		});
		this._IdSdkInstallInfo.connect('button-clicked', () => {
			this._IdPageRefresh.visible = false;
			this.#refresh();
		});
		this.connectGroup('SdkTool', {
			'run': () => {
				this.connectors.exec.communicateAsync([this.#run])
					.catch((e) => {
						this.utils.log.error(e);
					});
			},
			'maintenance': () => {
				this.connectors.exec.communicateAsync([this.#tool])
					.catch((e) => {
						this.utils.log.error(e);
					});
			},
		});
	}

	#downloadLatestAndRunInstall(isOffline) {
		this.#statePage(SdkPageStates.LOADING, _('Get latest version...'));
		this.utils.helper.getPromisePage(async () => {
			const available = this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.sdkAvailable())
			);
			if (available && available.value) {
				return available.value[0]
			} else {
				return undefined
			}
		}).then((latest) => {
			if (latest) {
				this.utils.creator.alertDialog(
					this.#window,
					_('Download'),
					_('Do you want download "{{version}}" Aurora SDK and run install?').setArguments({version: latest}),
					() => {
						this.#statePage(SdkPageStates.LOADING, _('Download...'));
						// Download
						this.utils.helper.getPromisePage(async () => {
							const resultRun = await this.utils.helper.getObjectAsync(
								/* query */	 this.connectors.aurora.sdkInstall(latest, isOffline),
								/* valid */	 (object) => {
									if (object && object.value && !isNaN(parseInt(object.value))) {
										this.#statePage(SdkPageStates.LOADING, _('Download...') + ` (${object.value}%)`);
										return false;
									}
									if (object && object.value && object.value.includes('http')) {
										return false;
									}
									return object.code !== 100;
								},
							);
							return resultRun.code !== 500;
						}).then((response) => {
							if (response) {
								this.#statePage(SdkPageStates.INSTALL_INFO);
							} else {
								this.#statePage(SdkPageStates.ERROR);
							}
						});
					},
					() => {
						this.#refresh();
					}
				);
			} else {
				this.#statePage(SdkPageStates.ERROR);
			}
		});
	}
});
