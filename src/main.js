import 'gi://Gdk?version=4.0';
import 'gi://Gtk?version=4.0';
import 'gi://Adw?version=1';

import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import './base/extensions/DBusProxy.js';
import './base/extensions/GioSettings.js';
import './base/extensions/GtkWidget.js';
import './base/extensions/String.js';

import { Application } from './feature/Application.js';

pkg.localeName = _('Aurora Toolbox')

GLib.set_prgname(pkg.localeName);
GLib.set_application_name(pkg.localeName);
Gtk.Window.set_default_icon_name(pkg.name);

let _argv;
let _app;

export function main(argv) {
	_argv = argv;
	_app = new Application({ 'application-id': pkg.name });
	return _app.run(_argv);
}

export function appRestart() {
	if (_app !== undefined) {
		_app.quit();
        Gio.Subprocess.new([`/usr/local/bin/${pkg.name}`], null);
	}
}
