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
import { DBusProxy } from '../connectors/DBusProxy.js';

/**
 * Connect to dbus with emit value after connect
 *
 * @param {String} action - signal name
 * @param {Function} callback - callback value
 */
DBusProxy.prototype.connectWithEmit = function (action, callback = function(value) {}) {
    this.connect(action, (_, value) => {
        callback(value)
    });
    if (this[action] !== undefined) {
        this.emit(action, this[action]);
    }
};
