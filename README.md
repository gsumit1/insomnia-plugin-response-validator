# insomnia-plugin-response-validator

This is a plugin for Insomnia API client that can validate the response based upon expected result.

## Installation

Install ``insomnia-plugin-response-validator`` plugin from Preferences > Plugins.

## Usage

Add a header `INSOMNIA-RESPONSE-VALIDATOR` with a json comparising of jsonpath and expected values.

## Setup the Header 

<img width="1286" alt="image" src="https://user-images.githubusercontent.com/17493208/206656464-1e8d308e-ab58-490c-9f26-5fad64d5a064.png">

## Validator

Key: JSONPATH
Value: Expected Value

Note: To validate the response code of the request add ``"INSA-ResponseCode":"200"``. 

```json
{
"INSA-ResponseCode":"200",
"$.status" : "success", 
"$.data[10].employee_name" : "Jena Gaines"
}
```

Note: To validate the a fixed set of values like:
```json
{
"$.status" : ["valid","success","ok"],
}
```
It will check if $.status is in "success" or "ok".
> The first index needs to start with 'valid'

Note: To validate the interval value like:

```json
{
"$.code":["range",200,300]
}
```
It will check if $.code is in the range of 200 to 300, containing 200 and 300 boundary values.
> The first index needs to start with 'range' and the range must have 2 values, sorted from smallest to largest.

## Test Execution Result

Test Execution result will be appended at the top of the response as follows
<img width="514" alt="image" src="https://user-images.githubusercontent.com/17493208/206657016-5a42f04f-d8bf-4c18-94b6-576ec3055581.png">

## More info for Debug
View-->Toggle DevTools-->Console

<img width="581" alt="consoleResult" src="https://user-images.githubusercontent.com/17493208/206235287-5188c23b-c622-45d5-9600-ae0f75769407.png">
