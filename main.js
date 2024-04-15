var jp = require("jsonpath");
const __ = require('hamjest');
var tools = require('./tools.js');
const fs = require('fs');
module.exports.responseHooks = [
    (context) => {

        const jsonPath = context.request.getHeader("INSOMNIA-RESPONSE-VALIDATOR");
        let errors = 0;

        if (jsonPath) {
            let response = {};
            try {
                actualStatusCode = context.response.getStatusCode();
                response = JSON.parse(context.response.getBody().toString());

            } catch (error) {
                console.error("Error in the response body " + context.request.getName(), error);
                context.response.setBody(Buffer.from("{\n\"Error in the response. Refer Console for details\"\,\n" + JSON.stringify(response).slice(1)));
                return
            }

            try {
                jsonObject = JSON.parse(jsonPath.toString());
            } catch (error) {
                console.error("Error in INSOMNIA-RESPONSE-VALIDATOR header or in parsing the header for request " + context.request.getName(), error);
                context.response.setBody(Buffer.from("{\n\"Error in INSOMNIA-RESPONSE-VALIDATOR header. Refer Console for details\"\,\n" + JSON.stringify(response).slice(1)));
                return
            }

            console.log("********** Test Execution Started For Individual Request Of " + context.request.getName() + " **************")
            Object.keys(jsonObject).forEach(key => {
                try {
                    if (key == "INSA-ResponseCode") {
                        __.assertThat("Status Code validation failed. The expected status code " + jsonObject[key] + " but the actual status code " + actualStatusCode, actualStatusCode, __.is(parseInt(jsonObject[key])));
                    } else {
                        var actualValues = jp.query(response, key)
                        if (typeof jsonObject[key] === 'string' || jsonObject[key] instanceof String) {
                            __.assertThat(actualValues, eval(jsonObject[key]))
                        }
                    }
                    console.log("Test For JSONPATH :" + key + ": Passed");
                } catch (error) {
                    errors++;
                    console.error("Either JSONPATH or Key has issue for request " + context.request.getName() + "\n" + error);
                }
            })

            if (errors == 0) {
                context.response.setBody(Buffer.from("{\n\"INSOMNIA-RESPONSE-TEST-EXECUTION-RESULT\":\"PASS\",\n" + JSON.stringify(response).slice(1)));
                console.log("Assertion Passed");
            } else {
                context.response.setBody(Buffer.from("{\n\"INSOMNIA-RESPONSE-TEST-EXECUTION-RESULT\":\"FAIL\",\n" + JSON.stringify(response).slice(1)));
                console.error("Assertion Failed");
            }
        }
    },
];


module.exports.requestGroupActions = [
    {
        label: "Run All Requests",
        action: async (context, data) => {

            if (data.requests.length == 0) {
                console.log("No requests to run")
                const html = `<hr class="pad-top"><p class="notice info no-margin-top">Run on folder containing requestes. See <a href="https://github.com/gsumit1/insomnia-plugin-response-validator" class="theme--link">Documentation</a> for more info.</p>`;
                context.app.showGenericModalDialog('No Requestes To Process For Folder : ' + data.requestGroup.name, { html });
                return
            }

            const { requests } = data;
            let promiseList = [];
            let results = [];
            let map = new Map();

            for (const request of requests) {
                let temp = [];
                temp.push(request.method)
                temp.push(request.name);
                try {
                    let requestHeader = request.headers.filter(header => header.name === "INSOMNIA-RESPONSE-VALIDATOR");
                    let jsonPath = requestHeader[0].value;
                    temp.push(jsonPath);
                } catch (error) { temp.push(false); }
                map.set(request._id, temp)
                response = context.network.sendRequest(request)
                promiseList.push(response)
            }

            await Promise.all(promiseList).then((responses) => {

                results.push(`<thead><tr><th>Request Name</><th>Result</th></tr></thead><tbody>`);

                for (const entireResponse of responses) {
                    try {
                        reqDetails = map.get(entireResponse.parentId);
                    } catch (error) { }
                    let reqMethod = reqDetails[0];
                    let reqName = reqDetails[1];
                    let jsonPath = reqDetails[2];
                    let errors = 0;


                    if (jsonPath) {
                        try {
                            actualStatusCode = entireResponse.statusCode;

                        } catch (error) {
                            console.error("Error in the response status code", error);
                            return;
                        }

                        try {
                            jsonObject = JSON.parse(jsonPath.toString());
                        } catch (error) {
                            console.error("Error in INSOMNIA-RESPONSE-VALIDATOR header or in parsing the header", error);
                            return
                        }

                        console.log("********** Test Execution Started From Bulk Request For " + reqName + " **************")
                        Object.keys(jsonObject).forEach(key => {
                            try {
                                if (key == "INSA-ResponseCode") {
                                    __.assertThat("Status Code validation failed. The expected status code " + jsonObject[key] + " but the actual status code " + actualStatusCode, actualStatusCode, __.is(parseInt(jsonObject[key])));
                                } else {

                                    if (entireResponse.bodyPath) {
                                        const responseBody = JSON.parse(fs.readFileSync(entireResponse.bodyPath, 'utf8'));
                                        response = JSON.parse(JSON.stringify(responseBody));
                                        var actualValues = jp.query(response, key)
                                        if (typeof jsonObject[key] === 'string' || jsonObject[key] instanceof String) {
                                            __.assertThat(actualValues, eval(jsonObject[key]))
                                            console.log("Test For JSONPATH :" + key + ": Passed");
                                        }
                                    } else {
                                        errors = NaN
                                    }
                                }

                            } catch (error) {
                                errors++;
                                console.error("Either JSONPATH or Key has issue in request " + reqName + "\n" + error);
                            }
                        })

                        if (errors == 0) {
                            results.push(`<tr><td>${reqMethod} : ${reqName}</td><td>Passed</td></tr>`);
                            console.log("Assertion Passed");
                        } else if (errors > 0) {
                            results.push(`<tr><td>${reqMethod} : ${reqName}</td><td>Failed</td></tr>`);
                            console.error("Assertion Failed");
                        } else if (errors === NaN) {
                            results.push(`<tr><td">${reqMethod} : ${reqName}</td><td>Timeout or error</td></tr>`);
                            console.log("Assertion Unknown");
                        }

                    } else {
                        if (entireResponse.statusCode > 0) { results.push(`<tr><td>${reqMethod} : ${reqName}</td><td>Status - ${entireResponse.statusCode} ${entireResponse.statusMessage}</td></tr>`) }
                        else { results.push(`<tr><td>${reqMethod} : ${reqName}</td><td>Timeout or Error </td></tr>`) }
                    }

                }
                results.push(`</tbody>`);

                const html = `<a class="sc-himrzO gofaxW made-with-love" href="https://github.com/gsumit1/insomnia-plugin-response-validator/">See&nbsp;<u>Documentation</u>&nbsp;for more info </a><hr class="pad-top"><table class="table--fancy table--striped table--valign-middle margin-top margin-bottom">${results.join('\n')}</table><a class="sc-himrzO gofaxW made-with-love" href="https://github.com/gsumit1/insomnia-plugin-response-validator/">Made with&nbsp; <div class="sc-dIouRR bNAJOc"><svg viewBox="0 0 24 24" width="1em" height="1em" role="img"><path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg></div> &nbsp;by Sumit</a>`;
                context.app.showGenericModalDialog('Test Execution Results Of Folder : ' + data.requestGroup.name, { html });

            }).catch((error) => {
                let reqNo = error.message.match(/req_\w*/g)
                console.log("Error in Promise.all", reqNo[0])
                const html = `<ul>Error in request or reponse : ${map.get(reqNo[0])[0]}</ul>`;
                context.app.showGenericModalDialog('Test Run Results' + data.requestGroup.name, { html });
                console.log("Error in Promise.all", error)
                console.error(error.message);
            });

        },
    },
];
