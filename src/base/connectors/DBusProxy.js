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
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

const SETTINGS_PORTAL_INTERFACE = `
<node>
	<interface name="org.freedesktop.portal.Settings">
		<method name="Read">
			<arg direction="in" type="s" name="namespace"/>
			<arg direction="in" type="s" name="key"/>
			<arg direction="out" type="v" name="value"/>
		</method>
		<signal name="SettingChanged">
			<arg type="s" name="namespace"/>
			<arg type="s" name="key"/>
			<arg type="v" name="value"/>
		</signal>
		<property name="version" access="read" type="u"/>
	</interface>
</node>
`;

export const DBusProxy = GObject.registerClass({
	GTypeName: 'AtbDBusProxy',
	Signals: {
		'colorScheme': {
			param_types: [GObject.TYPE_UINT]
		},
	},
}, class extends Gio.DBusProxy {

	#settingsPortalProxy;
	colorScheme;

	constructor(params) {
        super(params)
		this.#connectToSettingsPortal();
	}

	#connectToSettingsPortal() {
		const SettingsPortalProxy = Gio.DBusProxy.makeProxyWrapper(SETTINGS_PORTAL_INTERFACE);
		this.#settingsPortalProxy = new SettingsPortalProxy(
			Gio.DBus.session,
			'org.freedesktop.portal.Desktop',
			'/org/freedesktop/portal/desktop'
		);

		// Check that we're compatible with the settings portal
		if (this.#settingsPortalProxy.version > 3)
			return;

		this.colorScheme = this.#settingsPortalProxy.ReadSync('org.freedesktop.appearance', 'color-scheme')[0].recursiveUnpack();
		this.emit('colorScheme', this.colorScheme);

		this.#settingsPortalProxy.connectSignal(
			'SettingChanged',
			(_proxy, _nameOwner, [namespace, key, value]) => {
				if (namespace !== 'org.freedesktop.appearance' || key !== 'color-scheme')
					return;
				const colorScheme = value.recursiveUnpack();
				if (this.colorScheme == colorScheme)
					return;
				this.colorScheme = colorScheme;
				this.emit('colorScheme', this.colorScheme);
			}
		);
	}
});
