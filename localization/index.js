const fs = require('fs')
const yaml = require('js-yaml')

function readLocalization() {
    let localization = yaml.load(fs.readFileSync('example.en.yaml', 'utf-8'))

    for (let key in localization) {
        let value = localization[key];
        if (typeof value === 'string') {
            log(key, 'string value: [' + value + ']')
        } else if (typeof value === 'object') {
            readComplexLocalization(key, value);
        } else {
            error(key, 'unexpected value type: ' + typeof (value))
        }
    }
}

function readComplexLocalization(context, value) {
    let arguments = value.arguments;
    if (arguments) {
        if (typeof arguments !== 'object' || !Array.isArray(arguments)) {
            error(context, 'arguments is not an array - type: ' + typeof arguments)
        }
        log(context + '.arguments', '[' + arguments.join(', ') + ']')
    } else {
        error(context, 'Missing argument list for complex localization value')
    }
    let result = value.result
    if (result) {
        for (let childElementName in value) {
            if (!isKeyword(childElementName)) {
                let childElement = value[childElementName]
                readChildElement(context + '.' + childElementName, childElement);
            }
        }
    }
}

function isKeyword(childElementName) {
    switch (childElementName) {
        case 'result':
        case 'arguments':
            return true
        default:
            return false
    }
}

function readChildElement(context, childElement) {
    let type = childElement.type;
    if (type) {
        if (type === 'pluralization') {
            log(context, 'Encountered a pluralization')
        } else {
            error(context, 'Unsupported child element type: [' + type + ']')
        }
    } else {
        error(context, 'Missing type element')
    }
}

function log(context, value) {
    console.log(context + ': ' + value)
}

function error(context, message) {
    console.log(context + ': ' + message)
    process.exit(1)
}

readLocalization()
