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

import '../pages/device/DevicePage.js';
import '../pages/devices/DevicesPage.js';
import '../pages/emulator/EmulatorPage.js';
import '../pages/flutter/FlutterPage.js';
import '../pages/psdk/PsdkPage.js';
import '../pages/sdk/SdkPage.js';
import '../pages/tools/ToolsPage.js';
import '../pages/vscode/VscodePage.js';
import '../pages/welcome/WelcomePage.js';

const NavigationPages = Object.freeze({
	AtbDevicePage:		'IdAtbDevice',
	AtbDevicesPage:		'IdAtbDevices',
	AtbEmulatorPage:	'IdAtbEmulator',
	AtbFlutterPage:		'IdAtbFlutter',
	AtbPsdkPage:		'IdAtbPsdk',
	AtbSdkPage:			'IdAtbSdk',
	AtbToolsPage:		'IdAtbTools',
	AtbVscodePage:		'IdAtbVscode',
	AtbWelcomePage:		'IdAtbWelcome',

});

export const NavigationWidget = GObject.registerClass({
	GTypeName: 'AtbNavigationWidget',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/widgets/NavigationWidget.ui',
	InternalChildren: [
		'IdNavigation',
		...Object.keys(NavigationPages).map((k) => NavigationPages[k])
	],
}, class extends Gtk.Box {

	constructor(params) {
		super(params);
		this.#connectNavigationPages();
	}

	#connectNavigationPages() {
		Object.keys(NavigationPages).forEach((key) => {
			// Init signal from page back navigation
			try {
				this[`_${NavigationPages[key]}`].connect('navigation-back', () => {
					this._IdNavigation.pop()
				});
			} catch (e) {}
			// Init signal from page open tag navigation
			try {
				this[`_${NavigationPages[key]}`].connect('navigation-push', (_, value) => {
					this._IdNavigation.push_by_tag(value)
				});
			} catch (e) {}
		})
	}
});
