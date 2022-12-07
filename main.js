var jp = require("jsonpath");
module.exports.responseHooks = [
  (context) => {
    const jsonPath = context.request.getHeader("INSOMNIA-RESPONSE-VALIDATOR");
    var flag=0;
    let errors = 0;
    if (jsonPath) {
      let response = {};
      try {
        response = JSON.parse(context.response.getBody().toString());
      } catch (error) {
        console.error("Error parsing response body", error);
        return;
      } finally {
        console.log("********** Test Execution Started **************")
        try {
          jsonObject = JSON.parse(jsonPath.toString());
          Object.keys(jsonObject).forEach(key => { 
            console.log("Test For JSONPATH :"+ key); //keys 
            var actualValues = jp.query(response, key)
            if(jsonObject[key]==actualValues) 
              {
                console.log("PASS")
                console.log("Expected Value: " +jsonObject[key]);
                console.log("Actual Value: " +actualValues);
              }
            else { 
              console.log("FAIL")
              console.log("Expected Value: " +jsonObject[key]);
              console.log("Actual Value: " +actualValues);
              flag=1;
            }

        })
        } catch (error) {
          errors++;
          console.error(error);
        }
      }
      if (errors == 0 && flag==0) {
        context.response.setBody(Buffer.from(JSON.stringify(response).slice(0,-1)+",\n\"INSOMNIA-RESPONSE-TEST-EXECUTION-RESULT\":\"PASS\"\n}"));
      } else {
        context.response.setBody(Buffer.from(JSON.stringify(response).slice(0,-1)+",\n\"INSOMNIA-RESPONSE-TEST-EXECUTION-RESULT\":\"FAIL\"\n}"));
        console.error("Assertion Failed");
        flag=0;
      }
    }
  },
];
