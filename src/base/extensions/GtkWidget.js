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
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

/**
 * Simple way connect to actions
 *
 * @param {String} group Name group
 * @param {Object} actions Actions object name: callback
 */
Gtk.Widget.prototype.connectGroup = function (group, actions = {}) {
    const simpleActionGroup = new Gio.SimpleActionGroup();
    for (const [name, func] of Object.entries(actions)) {
        const action = new Gio.SimpleAction({ name });
        action.connect('activate', func);
        simpleActionGroup.add_action(action);
    }
    this.insert_action_group(group, simpleActionGroup);
};

/**
 * Connect with emit value
 *
 * @param {String} action - signal name
 * @param {Function} callback - callback value
 */
Gtk.Widget.prototype.connectWithEmit = function (action, callback = function(value) {}) {
    this.connect(action, (_, value) => {
        callback(value)
    });
    if (this[action] !== undefined) {
        this.emit(action, this[action]);
    }
};
