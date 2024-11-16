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
		'IdLoading',
		'IdDeviceEmpty',
		'IdPageRefresh',
		'IdButtonOpenTerminal',
	],
}, class extends Adw.NavigationPage {
	#window
	#params
	#info

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

	#statePage(state, message = undefined) {
		this.childrenHide(
			'IdPreferencesPage',
			'IdLoading',
			'IdDeviceEmpty',
			'IdPageRefresh',
		);
		if (state == DevicePageStates.LOADING) {
			this._IdDeviceBoxPage.valign = Gtk.Align.CENTER;
			this._IdLoading.showLoading(message);
			return this.childrenShow('IdLoading');
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
		this.#statePage(DevicePageStates.LOADING, _('Getting data...'));
		this.utils.helper.getPromisePage(async () => {
			const info = this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.deviceInfo(this.#params.host))
			);
			return {
				'info': this.utils.helper.getValueResponse(info, 'value'),
				'isTerminal': await this.utils.helper.isExistGnomeTerminal(),
			}
		}).then((response) => {
			try {
				if (response.info) {
					this.#initPage(response.info, response.isTerminal);
					this.#statePage(DevicePageStates.DONE);
				} else {
					this.#statePage(DevicePageStates.EMPTY);
				}
			} catch(e) {
				this.#statePage(DevicePageStates.EMPTY);
			}
		});
	}

	#initPage(info, isTerminal) {
		this.#info = info;
		this._IdDeviceInfo.icon = 'aurora-toolbox-device';
		this._IdDeviceInfo.title = info.PRETTY_NAME;
		this._IdDeviceInfo.subtitle = info.ARCH;
		this._IdButtonOpenTerminal.visible = isTerminal;
	}

	#actionsConnect() {
		this.connectGroup('DeviceTool', {
            'terminal': () => {
				var keyPath = ''
				if (this.#info.KEY) {
					keyPath = `-i ${this.#info.KEY}`
				}
				this.connectors.exec
					.communicateAsync(this.connectors.shell.gnomeTerminalOpen(
						`ssh -o 'ConnectTimeout=2' -o 'StrictHostKeyChecking=no' ${this.#params.user}@${this.#params.host} -p ${this.#params.port} ${keyPath}`
					))
			},
            'install': () => this.#installPackage(),
            'remove': () => this.#deletePackage(),
            'run': () => this.#runPackage(),
            'upload': () => this.#uploadFile(),
        });
		this._IdPageRefresh.connect('clicked', () => this.#refresh());
	}

	#deletePackage() {
		var dialog = this.utils.creator.textDialog(
			this.#window,
			_('Uninstall'),
			_('Specify the name of the package you want to uninstall.'),
			'com.package.name',
			/* validate */ (text) => {
				if (text.split('.').length !== 3) {
					return false;
				}
				return true;
			},
			/* success */ (text) => {
				dialog.loading();
				this.utils.helper.getPromisePage(async () => {
					const resultAPM = this.utils.helper.getLastObject(
						await this.connectors.exec.communicateAsync(this.connectors.aurora.devicePackageRemove(this.#params.host, text, true))
					);
					if (resultAPM.code == 200) {
						return {code: 200};
					}
					const resultPkcon = this.utils.helper.getLastObject(
						await this.connectors.exec.communicateAsync(this.connectors.aurora.devicePackageRemove(this.#params.host, text, false))
					);
					if (resultPkcon.code == 200) {
						return {code: 200};
					}
					return {code: 500};
				}).then((response) => {
					if (response && response.code === 200) {
						dialog.success(_('The package has been uninstall successfully!'));
					} else {
						dialog.error(_('Failed to uninstall package, please provide a valid package name.'));
					}
				});
			},
		);
	}

	#runPackage() {
		var dialog = this.utils.creator.textDialog(
			this.#window,
			_('Run package'),
			_('Specify the name of the package you want to run.'),
			'com.package.name',
			/* validate */ (text) => {
				if (text.split('.').length !== 3) {
					return false;
				}
				return true;
			},
			/* success */ (text) => {
				dialog.loading();
				this.utils.helper.getPromisePage(async () => {
					const resultRun = await this.utils.helper.getObjectAsync(
						/* query */	 this.connectors.aurora.devicePackageRun(this.#params.host, text),
						/* valid */	 () => true,
						/* c.log */	 true,
					);
					return { code: resultRun && resultRun.code === 200 ? 200 : 500 };
				}).then((response) => {
					if (response && response.code === 200) {
						dialog.close();
					} else {
						dialog.error(_('Failed to run package, please provide a valid package name.'));
					}
				});
			},
		);
	}

	#installPackage() {
		this.utils.creator.selectFileDialog(
			this.#window,
			new Gtk.FileFilter({
				name: _('RPM package'),
				mime_types: ['application/x-rpm'],
			}),
			/* success */ (path) => {
				const dialog = this.utils.creator.loadingDialog(this.#window);
				this.utils.helper.getPromisePage(async () => {
					const isAPM = Boolean(this.#info.VERSION_ID.match(/^5.+/g));
					const resultRun = await this.utils.helper.getObjectAsync(
						/* query */	 this.connectors.aurora.devicePackageInstall(this.#params.host, path, isAPM, isAPM),
						/* valid */	 (object) => {
							if (object && object.code === 100) {
								if (object.value) {
									dialog.state(_('Loading...') + ` (${object.value}%)`);
								} else {
									dialog.state(_('Installing...'));
								}
								return false;
							} else {
								this.utils.log.log(object);
								return true;
							}
						},
					);
					return { code: resultRun && resultRun.code === 200 ? 200 : 500 };
				}).then((response) => {
					if (response && response.code === 200) {
						dialog.success(_('The package was installed successfully!'));
					} else {
						dialog.error(_('Failed to install package. Please provide a valid package file.'));
					}
				});
			},
		);
	}

	#uploadFile() {
		this.utils.creator.selectFileDialog(
			this.#window,
			new Gtk.FileFilter({
				name: _('All Files'),
				patterns: ['*'],
			}),
			/* success */ (path) => {
				const dialog = this.utils.creator.loadingDialog(this.#window);
				this.utils.helper.getPromisePage(async () => {
					const resultRun = await this.utils.helper.getObjectAsync(
						/* query */	 this.connectors.aurora.deviceUpload(this.#params.host, path),
						/* valid */	 (object) => {
							if (object && object.code === 100) {
								if (object.value) {
									dialog.state(_('Loading...') + ` (${object.value}%)`);
								}
								return false;
							} else {
								return true;
							}
						},
					);
					return { code: resultRun && resultRun.code === 200 ? 200 : 500 };
				}).then((response) => {
					if (response && response.code === 200) {
						dialog.success(_('The file has been successfully downloaded to the ~/Download directory!'));
					} else {
						dialog.error(_('Error loading file, something went wrong.'));
					}
				});
			},
		);
	}
});
