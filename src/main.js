import 'gi://Gdk?version=4.0';
import 'gi://Gtk?version=4.0';
import 'gi://Adw?version=1';

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import './base/extensions/AdwDialog.js';
import './base/extensions/DBusProxy.js';
import './base/extensions/GioSettings.js';
import './base/extensions/GtkWidget.js';
import './base/extensions/String.js';

import { Application } from './feature/Application.js';

let _argv;
let _app;

export function main(argv) {
	_argv = argv;
	_app = new Application({ 'application-id': pkg.name })
	return _app.run(_argv);
}

export function appRestart() {
	if (_app !== undefined) {
		_app.quit();
        Gio.Subprocess.new([`${GLib.get_home_dir()}/.local/bin/${pkg.name}`], null);
	}
}
