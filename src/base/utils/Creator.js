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
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import { AlertDialog } from '../../feature/dialogs/AlertDialog.js';
import { PasswordDialog } from '../../feature/dialogs/PasswordDialog.js';
import { TextDialog } from '../../feature/dialogs/TextDialog.js';
import { LoadingDialog } from '../../feature/dialogs/LoadingDialog.js';

export const Creator = {
    /**
     * Create Adw.ActionRow
     */
    actionRow(
        target,
        callback
    ) {
		// Create action
		const actions = {};
		const group = `group-${target.replaceAll('.', '_')}`;
		const action = `action-${target.replaceAll('.', '_')}`;
		// Create widget
		const actionRow = new Adw.ActionRow({
			'title': target,
			'action-name': `${group}.${action}`,
		});
		// Action add icon
		actionRow.add_suffix(new Gtk.Image({
			'icon-name': 'go-next',
		}));
		// Activatable on yourself
		actionRow.set_activatable_widget(actionRow);
		// Add object action
		actions[action] = callback;
		// Activate action
		actionRow.connectGroup(group, actions);

		return actionRow;
    },
	/**
	 * Create alert dialog
	 */
	alertDialog(
		window,
		title,
		subtile,
		callback,
	) {
		new AlertDialog().present(window, title, subtile, callback);
	},
	/**
	 * Create auth root dialog
	 */
	authRootDialog(
		window,
		callback,
	) {
		new PasswordDialog().authRoot(window, callback);
	},
	/**
	 * Create auth root dialog
	 */
	authPsdkDialog(
		window,
		version,
		callback,
		callbackCancel,
	) {
		new PasswordDialog().authRootPsdk(window, version, callback, callbackCancel);
	},
	/**
	 * Create package dialog
	 */
	textDialog(
		window,
		title,
		subtitle,
		placeholder,
		validate = function(text) { return true; },
		submit = function(text) {},
		cancel = function() {},
	) {
		const dialog = new TextDialog()
		dialog.title = title;
		dialog.subtitle = subtitle;
		dialog.placeholder = placeholder;
		dialog.present(window);
		dialog.connect('validate', (_, text) => {
			if (validate) {
				return validate(text);
			}
			return true;
		});
		dialog.connect('submit', (_, text) => {
			if (submit) {
				submit(text);
			}
		});
		dialog.connect('cancel', () => {
			if (cancel) {
				cancel();
			}
		});
		return dialog;
	},
	/**
	 * Select file
	 */
	selectFileDialog(
		window,
		filter = undefined,
		submit = function(uri) {},
		cancel = function() {},
	) {
		const dialog = new Gtk.FileDialog();
		if (filter) {
			dialog.filters = new Gio.ListStore()
			dialog.filters.append(filter);
			dialog.default_filter = filter;
		}

		dialog.open(window, null, (__, res) => {
			try {
				submit(dialog.open_finish(res).get_path());
			} catch (e) {
				cancel();
			}
		});
		return dialog;
	},
	/**
	 * Simple loading dialog
	 */
	loadingDialog(
		window,
	) {
		const dialog = new LoadingDialog();
		dialog.present(window);
		return dialog;
	},
}
