import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const AboutDialog = GObject.registerClass({
	GTypeName: 'AtbAboutDialog',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/AboutDialog.ui',
	InternalChildren: ['IdAboutDialog'],
}, class extends Gtk.Widget {
	present(window) {
		this._IdAboutDialog.present(window);
	}
});
