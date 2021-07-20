const fs = require('fs')
const yaml = require('js-yaml')

const [pluralizationKeyNames, pluralizationKeys] = (() => {
    const pluralizationKeyNames = ['zero', 'one', 'two', 'few', 'many', 'other']
    let result = {}
    for (let name of pluralizationKeyNames) {
        result[name] = name
    }
    Object.freeze(result)
    let pluralizationKeyNameSet = new Set(pluralizationKeyNames)
    return [pluralizationKeyNameSet, result]
})()

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
    if (!result) {
        error(context, 'Missing argument list for complex localization value')
    }
    for (let childElementName in value) {
        if (!isComplexValueKeyword(childElementName)) {
            let childElement = value[childElementName]
            readVariable(context + '.' + childElementName, childElement);
        }
    }
}

function isComplexValueKeyword(elementName) {
    switch (elementName) {
        case 'result':
        case 'arguments':
            return true
        default:
            return false
    }
}

function readVariable(context, variable) {
    let type = variable.type;
    if (type) {
        if (type === 'pluralization') {
            let pluralization = readPluralization(context, variable);
            console.log(pluralization)
        } else {
            error(context, 'Unsupported variable type: [' + type + ']')
        }
    } else {
        error(context, 'Missing type element')
    }
}

function readPluralization(context, variable) {
    let result = {}
    if (variable.number) {
        let numberType = typeof variable.number;
        if (!numberType === 'string') {
            error(context, 'Unexpected type of chile element number: ' + numberType)
        }
        result.number = variable.number
    }
    for (let childElementName in variable) {
        if (pluralizationKeyNames.has(childElementName)) {
            let childElementValue = variable[childElementName]
            let chileElementValueType = typeof childElementValue;
            if (!chileElementValueType === 'string') {
                error(context, 'Unexpected type of child element ' + childElementName + ": " + chileElementValueType)
            }
            result[childElementName] = childElementValue
        } else if (!isPluralizationKeyword(childElementName)) {
            error(context, 'Unexpected element: ' + childElementName)
        }
    }
    return result
}

function isPluralizationKeyword(elementName) {
    switch (elementName) {
        case 'type':
        case 'number':
            return true
        default:
            return false
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
