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

import { Log } from '../utils/Log.js';

export const ShellExec = {
    /**
     * Execute command async multiple response
     *
     * @param {Array} query - params query
     * @param {function} resolve - call result
     * @param {function} reject - call error
     */
    communicateCallback(query = [], resolve = function(v) {}, reject = function(e) {}) {
        Log.debug(query);
        try {
            const arg = Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE;
            const subProcess = Gio.Subprocess.new(query, arg);
            // @todo
            // get_stdout_pipe
            // Gio.UnixInputStream has been moved to a separate platform-specific library.
            // https://gitlab.gnome.org/GNOME/gnome-shell/-/issues/7539
            const stdout = new Gio.DataInputStream({
                base_stream: subProcess.get_stdout_pipe(),
                close_base_stream: true,
            });

            const cancellable = new Gio.Cancellable();

            subProcess.wait_async(null, (source, res) => {
                source.wait_finish(res);
                cancellable.cancel();
            });

            let jsonStrings = []
            const generator = (stdout, res) => {
                try {
                    const [bytes] = stdout.read_line_finish(res);
                    if (bytes) {
                        const decoder = new TextDecoder('utf-8');
                        let readLine = decoder.decode(bytes);
                        jsonStrings.push(readLine)
                        if (readLine.charAt(0) === '}') {
                            resolve(jsonStrings.join('\n').parseMultipleJson());
                            jsonStrings = [];
                        }
                        if (readLine) {
                            stdout.read_line_async(0, cancellable, generator);
                        }
                    }
                } catch (e) {
                    reject(e)
                }
            };
            stdout.read_line_async(0, cancellable, generator);
        } catch (e) {
            reject(e)
        }
    },
    /**
     * Execute command async
     *
     * @param {Array} query - params query
     * @returns Promise
     */
    communicateAsync(query = []) {
        Log.debug(query);
        return new Promise((resolve, _) => {
            try {
                const arg = Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE;
                const subProcess = Gio.Subprocess.new(query, arg);
                subProcess.communicate_utf8_async(null, null, (proc, res) => {
                    let [success, stdout, stderr] = proc?.communicate_utf8_finish(res);
                    if (!success || stderr) {
                        resolve({ code: 500, message: `${stderr}` });
                    } else {
                        resolve(stdout.parseMultipleJson());
                    }
                });
            } catch (e) {
                resolve({ code: 500, message: `${e}` });
            }
        });
    },
    /**
     * Execute command
     *
     * @param {Array} query - params query
     * @returns Data response from API json
     */
    communicateSync(query = []) {
        Log.debug(query);
        try {
            const arg = Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE;
            const subProcess = Gio.Subprocess.new(query, arg);
            let [success, stdout, stderr] = subProcess.communicate_utf8(null, null);
            if (!success || stderr) {
                return null;
            }
            return stdout.parseMultipleJson();
        } catch (e) {
            return null;
        }
    },
}
