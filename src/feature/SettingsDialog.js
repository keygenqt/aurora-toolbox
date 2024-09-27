import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import * as Utils from './Utils.js';

export const SettingsDialog = GObject.registerClass({
	GTypeName: 'AtbSettingsDialog',
	Template: 'resource:///com/keygenqt/aurora-toolbox/ui/SettingsDialog.ui',
	InternalChildren: ['IdSettingsDialog', 'IdSelectLanguage'],
}, class extends Gtk.Widget {
	present(window) {
		this._IdSettingsDialog.present(window);
		this.#actionsConnect();
	}

	#actionsConnect() {
		this._IdSettingsDialog.insert_action_group('AtbSettingsDialog', Utils.addSimpleActions({
            'hint': () => console.log('hint'),
            'select': () => console.log('select'),
            'verbose': () => console.log('verbose'),
        }));
		this._IdSelectLanguage.connect('notify::selected-item', (e) => {
			console.log(e.get_selected())
		});
	}
});
