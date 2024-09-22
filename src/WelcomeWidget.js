import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const WelcomeWidget = GObject.registerClass({
	GTypeName: 'AtbWelcomeWidget',
	CssName: 'AtbWelcomeWidget',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/WelcomeWidget.ui',
}, class extends Gtk.Widget {});
