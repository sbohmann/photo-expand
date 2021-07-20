const fs = require('fs')
const yaml = require('js-yaml')

let localization = yaml.load(fs.readFileSync('example.en.yaml', 'utf-8'))
console.log(JSON.stringify(localization, undefined, 2))
console.log('[' + localization.years_on_hills.result + ']')

for (let key in localization) {
    console.log(key)
    let value = localization[key];
    console.log(value)
    if (typeof value === 'string') {
        console.log('string value: [' + value + ']')
    } else if (typeof value === 'object') {
        let type = value.type;
        if (type) {
            if (type === 'pluralization') {
                let arguments = value.arguments;
                if (arguments) {
                    if (typeof arguments !== 'array') {
                        console.log('arguments is not an array')
                    }
                    console.log(arguments)
                } else {
                    console.log('Missing argument list for complex localization value')
                }
            } else {
                console.log('Unsupported type: [' + type + ']')
            }
        } else {
            console.log('Missing type element')
        }
    }
}
