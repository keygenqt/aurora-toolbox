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

export const PsdkTargetPage = GObject.registerClass({
	GTypeName: 'AtbPsdkTargetPage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/psdkTarget/PsdkTargetPage.ui',
	InternalChildren: [
		'IdPsdkTargetBoxPage',
		'IdPreferencesPage',
		'IdPsdkTargetInfoGroup',
		'IdPsdkTargetInfo',
	],
}, class extends Adw.NavigationPage {
	#window
	#params

	// Start
	constructor(params) {
		super(params);
		this.tag = this.utils.constants.Pages.PsdkTargetPage;
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
		this.#params = this.#window.navigation().params(this.utils.constants.Pages.PsdkTargetPage);
		this.#initPage();
	}

	#initPage() {
		this._IdPsdkTargetInfo.icon = 'aurora-toolbox-target';
		this._IdPsdkTargetInfo.title = this.#params.target;
		this._IdPsdkTargetInfo.subtitle = _('PSDK') + ` ${this.#params.psdkVersion}`;
	}

	#actionsConnect() {
		this.connectGroup('PsdkTargetTool', {
			'clearSnapshot': () => this.#removeSnapshot(),
			'install': () => this.#installPackage(),
			'remove': () => this.#removePackage(),
		});
	}

	#removeSnapshot() {
		const version = this.#params.psdkVersion;
		const target = this.#params.target;
		this.utils.creator.authPsdkDialog(this.#window, version, () => {
			const dialog = this.utils.creator.loadingDialog(this.#window);
			this.utils.helper.getPromisePage(async () => {
				const resultRun = this.utils.helper.getLastObject(
					await this.connectors.exec.communicateAsync(this.connectors.aurora.psdkClear(target, version))
				);
				return {
					code: resultRun.code,
					message: resultRun.message,
				};
			}).then((response) => {
				if (response && response.code === 200) {
					dialog.success(response.message);
				} else {
					dialog.error(_('Error, something went wrong.'));
				}
			});
		});
	}

	#installPackage() {
		const version = this.#params.psdkVersion;
		const target = this.#params.target;
		this.utils.creator.authPsdkDialog(this.#window, version, () => {
			this.utils.creator.selectFileDialog(
				this.#window,
				new Gtk.FileFilter({
					name: _('RPM package'),
					mime_types: ['application/x-rpm'],
				}),
				/* success */ (path) => {
					const dialog = this.utils.creator.loadingDialog(this.#window);
					this.utils.helper.getPromisePage(async () => {
						const resultRun = this.utils.helper.getLastObject(
							await this.connectors.exec.communicateAsync(this.connectors.aurora.psdkPackageInstall(path, target, version))
						);
						return {
							code: resultRun.code,
							message: resultRun.message,
						};
					}).then((response) => {
						if (response && response.code === 200) {
							dialog.success(response.message);
						} else {
							dialog.error(_('Error, something went wrong.'));
						}
					});
				},
			);
		});
	}

	#removePackage() {
		const version = this.#params.psdkVersion;
		const target = this.#params.target;
		this.utils.creator.authPsdkDialog(this.#window, version, () => {
			var dialog = this.utils.creator.textDialog(
				this.#window,
				_('Uninstall'),
				_('Specify the name of the package you want to uninstall.'),
				'flutter-embedder',
				/* validate */ () => {
					return true;
				},
				/* success */ (text) => {
					dialog.loading();
					this.utils.helper.getPromisePage(async () => {
						const resultAPM = this.utils.helper.getLastObject(
							await this.connectors.exec.communicateAsync(this.connectors.aurora.psdkPackageRemove(text, target, version))
						);
						if (resultAPM.code == 200) {
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
		});
	}
});
