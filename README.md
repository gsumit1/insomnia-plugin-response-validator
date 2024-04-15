# insomnia-plugin-response-validator

This is a plugin for Insomnia API client that can validate the response based upon expected result for collection requests.
We can also run all requests in a given folder in parallel using this and share with you execution results.

## Installation

Install `insomnia-plugin-response-validator` plugin from Preferences > Plugins.

## Usage

Add a header `INSOMNIA-RESPONSE-VALIDATOR` with a json comparising of jsonpath and expected values to assert individual response

## Setup the Header

<img width="1286" alt="image" src="https://user-images.githubusercontent.com/17493208/206656464-1e8d308e-ab58-490c-9f26-5fad64d5a064.png">

## Validator

Key: JSONPATH
Value: Expected Value

Note: To validate the response code of the request add `"INSA-ResponseCode":"200"`.

The plugin is integrated with Hamjest, provides significant matcher functionality.
Since JSONPATH outputs arrays, we must use array-related matchers. Some of the examples are as follows.

All `hamjest` to be available as `__`.

### hasItems

    "$.data[*].id" : "__.hasItem(7)"
    "$.data[*].id" : "__.hasItem(__.greaterThan(8))"
    "$.data[*].id" : "__.hasItem(__.lessThan(3))"

### hasSize()

    "$.data[*].employee_name" : "__.hasSize(5)"
    "$.data[*].employee_name" : "__.hasSize(__.lessThan(3))"
    "$.data[*].employee_name" : "__.hasSize(__.greaterThan(8))"

### isEmpty()

    "$.data[*].employee_name" : "__.isEmpty()"

### contains

    "$.data[*].id" : "__.contains(5, 7, 10)"

### hasProperty

    "$.data[0]":"__.hasItems(__.hasProperties({'id': 7,'email': 'michael.lawson@reqres.in','first_name': 'Michael','last_name': 'Lawson','avatar':'https://reqres.in/img/faces/7-image.jpg'}))"

Refer https://github.com/rluba/hamjest/wiki/Matcher-documentation for more details on matchers

#

`INSOMNIA-RESPONSE-VALIDATOR:
{
"INSA-ResponseCode":"200",
"$.page":"__.hasItem(2)",
"$.total_pages":"__.hasItems(__.lessThan(4))"
"$.status" :"__.hasItem('success')",
"$.data[0].first_name":"__.hasItems('Michael')",  
"$.data[10].avatar" :"__.hasItems('https://reqres.in/img/faces/9-image.jpg')" 
}`

#

`Note: use single quote as shown above for string`

### Old Header Format (No longer supported)

`{"INSA-ResponseCode":"200",
"$.status" : "success",
"$.data[10].employee_name" : "Jena Gaines"}`

### New Header

`
{"INSA-ResponseCode":"200",
"$.status" : "__.hasItem('success')",  
"$.data[10].employee_name" : "__.hasItem('Jena Gaines')"}`

## Test Execution Result

Test Execution result will be appended at the top of the response as follows
<img width="514" alt="image" src="https://user-images.githubusercontent.com/17493208/206657016-5a42f04f-d8bf-4c18-94b6-576ec3055581.png">

## More info for Debug

View-->Toggle DevTools-->Console

<img width="581" alt="consoleResult" src="https://user-images.githubusercontent.com/17493208/206235287-5188c23b-c622-45d5-9600-ae0f75769407.png">

## Run All Requests

Right click on the target folder on the context menu --> click Run All Requests it will trigger all requests.

<img width="581" alt="Run All Requests" src="https://github.com/gsumit1/insomnia-plugin-response-validator/assets/17493208/67130fad-526e-4f5a-91c7-284911ed95d4">

Once all the requests processed, it will open up the execution dialog window which will give the execution result.

<img width="1549" alt="image" src="https://github.com/gsumit1/insomnia-plugin-response-validator/assets/17493208/2f69deef-3060-4a3e-beef-27758a63e62c">

During execution, it will evalutes the assert that setup as header against the response, based upon the assert, it will pass or fail the result. 
In the absence of an assert setup, a status code will be returned.  

Before running all request, setup the Request timeout to desired value otherwise requets will continue run, till timeout.

Insomania-->Settings...-->Insomania Preferences

<img width="1489" alt="image" src="https://github.com/gsumit1/insomnia-plugin-response-validator/assets/17493208/75f883f0-21e3-461c-91a1-3444d44cfb0c">


### You need to have NodeJS installed in your system to use this plugin
