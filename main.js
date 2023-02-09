var jp = require("jsonpath");
module.exports.responseHooks = [
    (context) => {
        const jsonPath = context.request.getHeader("INSOMNIA-RESPONSE-VALIDATOR");
        var flag = 0;
        let errors = 0;
        if (jsonPath) {
            let response = {};
            try {
                actualStatusCode = context.response.getStatusCode();
                response = JSON.parse(context.response.getBody().toString());
                jsonObject = JSON.parse(jsonPath.toString());
            } catch (error) {
                console.error("Error parsing response body", error);
                return;
            } finally {
                console.log("********** Test Execution Started **************")

                Object.keys(jsonObject).forEach(key => {

                    try {
                        if (key == "INSA-ResponseCode") {
                            if (jsonObject[key] != actualStatusCode) {
                                console.log("FAIL");
                                console.log("Status Code validation failed. The expected status code " + jsonObject[key] + " but the actual status code " + actualStatusCode);
                                flag = 1;
                            }
                        } else {
                            console.log("Test For JSONPATH :" + key); // keys
                            var actualValues = jp.query(response, key)
                            // judge if the value is an interval or a fixed set of values
                            // range ['range', 300, 850]
                            // fixed set ["value","300","850"] 
                            jsonObjectValue = jsonObject[key];
                            if (typeof jsonObjectValue === 'object' && (jsonObjectValue[0] === 'range' || jsonObjectValue[0] === 'valid')) {
                                if (jsonObjectValue[0] === 'range') {
                                    if (jsonObjectValue.length === 3) {
                                        if (jsonObjectValue[1] <= actualValues && actualValues <= jsonObjectValue[2]) {
                                            console.log("PASS")
                                            console.log("Expected Value : [" + jsonObjectValue[1] + "，" + jsonObjectValue[2] + "]");
                                            console.log("Actual Value: " + actualValues);
                                        } else {
                                            console.log("FAIL")
                                            console.log("Expected Value : [" + jsonObjectValue[1] + "，" + jsonObjectValue[2] + "]");
                                            console.log("Actual Value: " + actualValues);
                                            flag = 1;
                                        }
                                    }else{
                                        console.log("FAIL")
                                        console.log("Expected Value range count: 2");
                                        console.log("Actual Value range count: " + (jsonObjectValue.length-1));
                                        flag = 1;
                                    }
                                } else if (jsonObjectValue[0] === 'valid') {
                                    var result = false;
                                    for (var item of jsonObjectValue) {
                                        if (item === 'valid') {
                                            continue;
                                        }
                                        console.log(JSON.parse(item))
                                        console.log(typeof item)
                                        console.log(actualValues[0])
                                        if (item == actualValues) {
                                            console.log("PASS")
                                            console.log("Expected Value: " + item);
                                            console.log("Actual Value: " + actualValues);
                                            result = true
                                            break;
                                        }
                                    }
                                    if (!result) {
                                        flag = 1
                                    }
                                }
                            // normal [300, 850]
                            } else if (jsonObject[key] == actualValues) {
                                console.log("PASS")
                                console.log("Expected Value: " + jsonObject[key]);
                                console.log("Actual Value: " + actualValues);
                            } else {
                                console.log("FAIL")
                                console.log("Expected Value: " + jsonObject[key]);
                                console.log("Actual Value: " + actualValues);
                                flag = 1;
                            }
                        }
                    } catch (error) {
                        errors++;
                        console.error("Either JSONPATH or Key has issue" + "\n" + error);
                    }
                })

            }
            if (errors == 0 && flag == 0) {
                context.response.setBody(Buffer.from("{\n\"INSOMNIA-RESPONSE-TEST-EXECUTION-RESULT\":\"PASS\",\n" + JSON.stringify(response).slice(1)));
            } else {
                context.response.setBody(Buffer.from("{\n\"INSOMNIA-RESPONSE-TEST-EXECUTION-RESULT\":\"FAIL\",\n" + JSON.stringify(response).slice(1)));
                console.error("Assertion Failed");
                flag = 0;
            }
        }
    },
];