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

/**
 * Add arguments to url
 *
 * @param {Object} arg = url argument
 * @returns url with arguments
 */
String.prototype.argUri = function (arg = {}) {
    const keys = Object.keys(arg)
    if (keys.length === 0) {
        return this;
    } else {
        return this + '?' + Object.keys(arg).map((key) => {
            return `${key}=${arg[key]}`;
        }).join('&');
    }
};

String.prototype.parseMultipleJson = function () {
    if (this.charAt(0) == '[' || this.charAt(0) == '{') {
        try {
            return JSON.parse(this);
        } catch(e) {
            if (e.name == 'SyntaxError') {
                try {
                    const values = [];
                    const elements = this
                        .split(new RegExp('\n\{', 'g'))
                        .map((e) => e.charAt(0) !== '{' ? `{${e}` : e)
                        .map((e) => e.trim());
                    for (const element of elements) {
                        values.push(JSON.parse(element));
                    }
                    return values;
                } catch(e) {
                    return null;
                }
            }
            return null;
        }
    } else {
        return this.split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
    }
};
