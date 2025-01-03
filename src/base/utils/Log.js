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
 * Just common log for application
 */
export const Log = {
    error: function(error) {
        console.error(error);
    },
    warn: function(error) {
        console.warn(error);
    },
    debug: function(data) {
        console.debug(data);
    },
    log: function(data) {
        if (typeof data === 'string' || data instanceof String) {
            console.log(data);
        } else {
            if (data.code && data.value && data.index !== undefined) {
                console.log(`${data.index} ${data.value}`);
            }
            else if (data.code && data.message) {
                if (data.value && data.value.stdout) {
                    console.log(`Code: ${data.code}, ${data.message}\n${data.value.stdout}`);
                } else {
                    console.log(`Code: ${data.code}, ${data.message}`);
                }
            } else {
                console.log(data);
            }
        }
    },
}
