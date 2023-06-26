var jp = require("jsonpath");
const __ = require('hamjest');
module.exports.responseHooks = [
    (context) => {
        const jsonPath = context.request.getHeader("INSOMNIA-RESPONSE-VALIDATOR");
        var flag=0;
        let errors = 0;
        if (jsonPath) {
            let response = {};
            try {
                actualStatusCode = context.response.getStatusCode();
                response = JSON.parse(context.response.getBody().toString());                
            } catch (error) {
                console.error("Error in the response body", error);
                context.response.setBody(Buffer.from("{\n\"Error in the response. Refer Console for details\"\,\n" + JSON.stringify(response).slice(1)));
                return
            } 

            try {
                jsonObject = JSON.parse(jsonPath.toString());
            } catch(error){
                console.error("Error in INSOMNIA-RESPONSE-VALIDATOR header or in parsing the header", error);
                context.response.setBody(Buffer.from("{\n\"Error in INSOMNIA-RESPONSE-VALIDATOR header. Refer Console for details\"\,\n" + JSON.stringify(response).slice(1)));
                return
            }
            
            console.log("********** Test Execution Started **************")
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
                    console.error("Either JSONPATH or Key has issue" + "\n" + error);
                }
            })
            
            if (errors == 0 ) {
                context.response.setBody(Buffer.from("{\n\"INSOMNIA-RESPONSE-TEST-EXECUTION-RESULT\":\"PASS\",\n" + JSON.stringify(response).slice(1)));
                console.log("Assertion Passed");
            } else {
                context.response.setBody(Buffer.from("{\n\"INSOMNIA-RESPONSE-TEST-EXECUTION-RESULT\":\"FAIL\",\n" + JSON.stringify(response).slice(1)));
                console.error("Assertion Failed");  
            }
        }
    },
];

