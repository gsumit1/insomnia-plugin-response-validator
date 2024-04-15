var ZSchema = require("z-schema");
const fs = require('fs');

module.exports = { 
    validateSchema: function(data,pathKey){
        let error=0
        let validator = new ZSchema();
        const schema = JSON.parse(fs.readFileSync(pathKey, 'utf8'));

        let valid = validator.validate(data, schema);

        if (!valid) {
            console.log(validator.getLastErrors());
            console.error("Schema Validation Failed");
            error=error+1
            return error
        }
        return error
    }
}