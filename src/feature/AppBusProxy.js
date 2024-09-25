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

export const AppBusProxy = GObject.registerClass({
	GTypeName: 'AtbDBusProxy',
	Signals: {
		'color-scheme': {
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
		this.emit('color-scheme', this.colorScheme);

		this.#settingsPortalProxy.connectSignal(
			'SettingChanged',
			(_proxy, _nameOwner, [namespace, key, value]) => {
				if (namespace !== 'org.freedesktop.appearance' || key !== 'color-scheme')
					return;
				const colorScheme = value.recursiveUnpack();
				if (this.colorScheme == colorScheme)
					return;
				this.colorScheme = colorScheme;
				this.emit('color-scheme', this.colorScheme);
			}
		);
	}
});
