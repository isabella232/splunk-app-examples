
// Copyright 2011 Splunk, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License"): you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

// This example will login to Splunk, perform a oneshot search, and then print 
// out the raw results and some key-value pairs. A one search is one that 
// won't return until the search is complete and return all the search
// results in the response.

let splunkjs = require('splunk-sdk');
let Async = splunkjs.Async;

exports.main = function (opts, callback) {
    // This is just for testing - ignore it
    opts = opts || {};

    let username = opts.username    || "admin";
    let password = opts.password    || "changed!";
    let scheme   = opts.scheme      || "https";
    let host     = opts.host        || "localhost";
    let port     = opts.port        || "8089";
    let version  = opts.version     || "default";

    let service = new splunkjs.Service({
        username: username,
        password: password,
        scheme: scheme,
        host: host,
        port: port,
        version: version
    });

    Async.chain([
        // First, we log in
        function (done) {
            service.login(done);
        },
        // Perform the search
        function (success, done) {
            if (!success) {
                done("Error logging in");
            }

            service.oneshotSearch("search index=_internal | head 3", {}, done);
        },
        // The job is done, and the results are returned inline
        function (results, done) {
            // Find the index of the fields we want
            let rawIndex = results.fields.indexOf("_raw");
            let sourcetypeIndex = results.fields.indexOf("sourcetype");
            let userIndex = results.fields.indexOf("user");

            // Print out each result and the key-value pairs we want
            console.log("Results: ");
            for (let i = 0; i < results.rows.length; i++) {
                console.log("  Result " + i + ": ");
                console.log("    sourcetype: " + results.rows[i][sourcetypeIndex]);
                console.log("    user: " + results.rows[i][userIndex]);
                console.log("    _raw: " + results.rows[i][rawIndex]);
            }

            done();
        }
    ],
        function (err) {
            callback(err);
        }
    );
};

if (module === require.main) {
    exports.main({}, function () { /* Empty function */ });
}
