# insomnia-plugin-response-validator

This is a plugin for Insomnia API client that can validate the response based upon expected result.

## Installation

Install ``insomnia-plugin-response-validator`` plugin from Preferences > Plugins.

## Usage

Add a header `INSOMNIA-RESPONSE-VALIDATOR` with a json comparising of jsonpath and expected values.

## Setup the Header 

<img width="932" alt="HeaderSetUp" src="https://user-images.githubusercontent.com/17493208/206232231-7af452cb-c68e-4301-8490-59df5a799f2e.png">

## Validator

Key: JSONPATH
Value: Expected Value

``
{
"$.status" : "success", 
"$.data[10].employee_name" : "Jena Gaines"
}
``

## Test Execution Result

Test Execution result will be appended at the bottom of the response as follows
<img width="586" alt="ExecutionResult" src="https://user-images.githubusercontent.com/17493208/206233900-478a69d6-9b98-4af5-aef0-8945cc7de6ad.png">

## More info for Debug
View-->Toggle DevTools-->Console

<img width="581" alt="consoleResult" src="https://user-images.githubusercontent.com/17493208/206235287-5188c23b-c622-45d5-9600-ae0f75769407.png">
