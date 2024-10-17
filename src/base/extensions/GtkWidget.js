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

import { AppConstants } from '../constants/AppConstants.js';
import { Creator } from '../utils/Creator.js';
import { Helper } from '../utils/Helper.js';
import { Log } from '../utils/Log.js';

import { ShellExec } from '../connectors/ShellExec.js';
import { AuroraAPI } from '../connectors/AuroraAPI.js';
import { ShellAPI } from '../connectors/ShellAPI.js';

Gtk.Widget.prototype.utils = {
    constants: AppConstants,
    creator: Creator,
    helper: Helper,
    log: Log,
};

Gtk.Widget.prototype.connectors = {
    aurora: AuroraAPI,
    shell: ShellAPI,
    exec: ShellExec,
};

/**
 * Simple way connect to actions
 *
 * @param {String} group Name group
 * @param {Object} actions Actions object name: callback
 */
Gtk.Widget.prototype.connectGroup = function (group, actions = {}) {
    const simpleActionGroup = new Gio.SimpleActionGroup();
    for (const [name, func] of Object.entries(actions)) {
        const action = new Gio.SimpleAction({ name: name });
        action.connect('activate', func);
        simpleActionGroup.insert(action);
    }
    this.insert_action_group(group, simpleActionGroup);
    return simpleActionGroup;
};

/**
 * Simple way create action
 *
 * @param {String} action Name action
 */
Gtk.Widget.prototype.createAction = function (name, func) {
    const action = new Gio.SimpleAction({ name: name });
    action.connect('activate', func);
    return action;
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

/**
 * Hide list children
 *
 * @param {Array} children - keys children
 */
Gtk.Widget.prototype.childrenHide = function (...children) {
    children.forEach((key) => {
        if (this[`_${key}`]) {
            this[`_${key}`].visible = false;
        }
    })
};

/**
 * Show list children
 *
 * @param {Array} children - keys children
 */
Gtk.Widget.prototype.childrenShow = function (...children) {
    children.forEach((key) => {
        if (this[`_${key}`]) {
            this[`_${key}`].visible = true;
        }
    })
};
