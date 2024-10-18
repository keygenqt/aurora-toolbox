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

const VscodePageStates = Object.freeze({
	LOADING:	1,
	EMPTY:		2,
	DONE:		3,
});

export const VscodePage = GObject.registerClass({
	GTypeName: 'AtbVscodePage',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/pages/vscode/VscodePage.ui',
	InternalChildren: [
		'IdVscodeBoxPage',
		'IdPreferencesPage',
		'IdVscodeInfoGroup',
		'IdVscodeInfo',
		'IdVscodeLoading',
		'IdVscodeEmpty',
		'IdPageAbout',
		'IdPageRefresh',
		'IdButtonExtensionsFlutterIcon',
		'IdButtonExtensionsFlutterOk',
		'IdButtonExtensionsCpptoolsIcon',
		'IdButtonExtensionsCpptoolsOk',
		'IdButtonExtensionsCmakeIcon',
		'IdButtonExtensionsCmakeOk',
		'IdButtonExtensionsMesonIcon',
		'IdButtonExtensionsMesonOk',
		'IdButtonExtensionsCheckerIcon',
		'IdButtonExtensionsCheckerOk',
		'IdButtonExtensionsHighlightIcon',
		'IdButtonExtensionsHighlightOk',
	],
}, class extends Adw.NavigationPage {
	#window
	#actionGroup
	#actionExtensionsFlutter
	#actionExtensionsCpptools
	#actionExtensionsCmake
	#actionExtensionsMeson
	#actionExtensionsChecker
	#actionExtensionsHighlight

	constructor(params) {
		super(params);
		this.tag = this.utils.constants.Pages.VscodePage;
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
			'IdVscodeLoading',
			'IdVscodeEmpty',
			'IdPageRefresh',
		);
		if (state == VscodePageStates.LOADING) {
			this._IdVscodeBoxPage.valign = Gtk.Align.CENTER;
			this._IdVscodeLoading.showLoading(message);
			return this.childrenShow('IdVscodeLoading');
		}
		if (state == VscodePageStates.EMPTY) {
			this._IdVscodeBoxPage.valign = Gtk.Align.CENTER;
			return this.childrenShow('IdVscodeEmpty', 'IdPageRefresh');
		}
		if (state == VscodePageStates.DONE) {
			this._IdVscodeBoxPage.valign = Gtk.Align.TOP;
			return this.childrenShow('IdPreferencesPage', 'IdPageRefresh');
		}
	}

	#initData() {
		this.#statePage(VscodePageStates.LOADING, _('Getting data...'));
		this.utils.helper.getPromisePage(async () => {
			const info = this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.vscodeInfo())
			);
			if (info && info.value && info.value.VERSION === 'undefined') {
				return undefined;
			}
			const extensions = this.utils.helper.getLastObject(
				await this.connectors.exec.communicateAsync(this.connectors.aurora.vscodeExtensionsList())
			);
			return {
				info: info.value,
				extensions: extensions.value,
			}
		}).then((response) => {
			try {
				if (response) {
					this.#initPage(response.info);
					this.#initExtensions(response.extensions);
					this.#statePage(VscodePageStates.DONE);
				} else {
					this.#statePage(VscodePageStates.EMPTY);
				}
			} catch(e) {
				this.#statePage(VscodePageStates.EMPTY);
				this.utils.log.error(e);
			}
		});
	}

	#initPage(info) {
		this._IdVscodeInfo.icon = 'aurora-toolbox-vscode';
		this._IdVscodeInfo.title = _('Visual Studio Code');
		this._IdVscodeInfo.subtitle = info.VERSION;
	}

	#initExtensions(extensions) {
		// Flutter & Dart
		if (extensions.includes('dart-code.dart-code') && extensions.includes('dart-code.flutter')) {
			this._IdButtonExtensionsFlutterIcon.visible = false;
			this._IdButtonExtensionsFlutterOk.visible = true;
			this.#actionGroup.remove(this.#actionExtensionsFlutter.name);
		} else {
			this._IdButtonExtensionsFlutterIcon.visible = true;
			this._IdButtonExtensionsFlutterOk.visible = false;
			this.#actionGroup.insert(this.#actionExtensionsFlutter);
		}
		// C++
		if (extensions.includes('ms-vscode.cpptools')
			&& extensions.includes('ms-vscode.cpptools-themes')
			&& extensions.includes('ms-vscode.cpptools-extension-pack'))
		{
			this._IdButtonExtensionsCpptoolsIcon.visible = false;
			this._IdButtonExtensionsCpptoolsOk.visible = true;
			this.#actionGroup.remove(this.#actionExtensionsCpptools.name);
		} else {
			this._IdButtonExtensionsCpptoolsIcon.visible = true;
			this._IdButtonExtensionsCpptoolsOk.visible = false;
			this.#actionGroup.insert(this.#actionExtensionsCpptools);
		}
		// Cmake
		if (extensions.includes('ms-vscode.cmake-tools') && extensions.includes('twxs.cmake')) {
			this._IdButtonExtensionsCmakeIcon.visible = false;
			this._IdButtonExtensionsCmakeOk.visible = true;
			this.#actionGroup.remove(this.#actionExtensionsCmake.name);
		} else {
			this._IdButtonExtensionsCmakeIcon.visible = true;
			this._IdButtonExtensionsCmakeOk.visible = false;
			this.#actionGroup.insert(this.#actionExtensionsCmake);
		}
		// Meson
		if (extensions.includes('mesonbuild.mesonbuild')) {
			this._IdButtonExtensionsMesonIcon.visible = false;
			this._IdButtonExtensionsMesonOk.visible = true;
			this.#actionGroup.remove(this.#actionExtensionsMeson.name);
		} else {
			this._IdButtonExtensionsMesonIcon.visible = true;
			this._IdButtonExtensionsMesonOk.visible = false;
			this.#actionGroup.insert(this.#actionExtensionsMeson);
		}
		// Checker
		if (extensions.includes('streetsidesoftware.code-spell-checker')
			&& extensions.includes('streetsidesoftware.code-spell-checker-russian'))
		{
			this._IdButtonExtensionsCheckerIcon.visible = false;
			this._IdButtonExtensionsCheckerOk.visible = true;
			this.#actionGroup.remove(this.#actionExtensionsChecker.name);
		} else {
			this._IdButtonExtensionsCheckerIcon.visible = true;
			this._IdButtonExtensionsCheckerOk.visible = false;
			this.#actionGroup.insert(this.#actionExtensionsChecker);
		}
		// Spaces
		if (extensions.includes('ybaumes.highlight-trailing-white-spaces')) {
			this._IdButtonExtensionsHighlightIcon.visible = false;
			this._IdButtonExtensionsHighlightOk.visible = true;
			this.#actionGroup.remove(this.#actionExtensionsHighlight.name);
		} else {
			this._IdButtonExtensionsHighlightIcon.visible = true;
			this._IdButtonExtensionsHighlightOk.visible = false;
			this.#actionGroup.insert(this.#actionExtensionsHighlight);
		}
	}

	#actionsConnect() {
		this._IdPageAbout.connect('clicked', () => {
			this.utils.helper.uriLaunch(this.#window, this.utils.constants.Docs.vscode);
		});
		this._IdPageRefresh.connect('clicked', () => {
			this._IdPageRefresh.visible = false;
			this.#refresh();
		});
		// Init group
		this.#actionGroup = this.connectGroup('VscodeTool', {
			'run': () => this.connectors.exec.communicateAsync(['code']),
			'updateSettings': () => this.#updateSettings(),
		});
		// Create dynamic actions
		this.#actionExtensionsFlutter = this.createAction(
			'extensionsFlutter',
			() => this.#installExtensions([
				'dart-code.dart-code',
				'dart-code.flutter'
			])
		);
		this.#actionExtensionsCpptools = this.createAction(
			'extensionsCpptools',
			() => this.#installExtensions([
				'ms-vscode.cpptools',
				'ms-vscode.cpptools-themes',
				'ms-vscode.cpptools-extension-pack'
			])
		);
		this.#actionExtensionsCmake = this.createAction(
			'extensionsCmake',
			() => this.#installExtensions([
				'ms-vscode.cmake-tools',
				'twxs.cmake'
			])
		);
		this.#actionExtensionsMeson = this.createAction(
			'extensionsMeson',
			() => this.#installExtensions([
				'mesonbuild.mesonbuild'
			])
		);
		this.#actionExtensionsChecker = this.createAction(
			'extensionsChecker',
			() => this.#installExtensions([
				'streetsidesoftware.code-spell-checker',
				'streetsidesoftware.code-spell-checker-russian'
			])
		);
		this.#actionExtensionsHighlight = this.createAction(
			'extensionsHighlight',
			() => this.#installExtensions([
				'ybaumes.highlight-trailing-white-spaces'
			])
		);
	}

	#installExtensions(extensions) {
		this.#statePage(VscodePageStates.LOADING, _('Preparation...'));
		this.utils.helper.getPromisePage(async () => {
			for (const extension of extensions) {
				this.#statePage(VscodePageStates.LOADING, _(`Install ${extension}...`));
				await this.connectors.exec.communicateAsync(
					this.connectors.aurora.vscodeExtensionInstall(extension)
				);
			}
			return true;
		}).then(() => this.#refresh());
	}

	#updateSettings() {
		this.#statePage(VscodePageStates.LOADING, _('Update settings...'));
		this.utils.helper.getPromisePage(async () => {
			await this.connectors.exec.communicateAsync(
				this.connectors.aurora.vscodeUpdateSettings()
			);
			return true;
		}).then(() => this.#refresh());
	}
});
