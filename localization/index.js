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
        for (let argument of arguments) {
            if (isReservedArgumentName(argument.name)) {
                error(context, 'Argument names [' + argument.name + "] is reserved")
            }
        }
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

function isReservedArgumentName(name) {
    switch (name) {
        case 'number':
        case 'name':
        case 'value':
            return true
        default:
            return false
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
            return (locale, arguments, number) => {
                return pluralize(locale, pluralization, arguments, number)
            }
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
            error(context, 'Unexpected type of child element [number:] ' + numberType)
        }
        result.number = variable.number
    }
    for (let childElementName in variable) {
        if (pluralizationKeyNames.has(childElementName)) {
            let childElementValue = variable[childElementName]
            let childElementValueType = typeof childElementValue;
            if (!childElementValueType === 'string') {
                error(context, 'Unexpected type of child element [' + childElementName + "]: " + childElementValueType)
            }
            result[childElementName] = childElementValue
        } else if (!isPluralizationKeyword(childElementName)) {
            error(context, 'Unexpected element: ' + childElementName)
        }
    }
    if (!result.other) {
        error(context, 'Number class [other] missing as required fallback')
    }
    result.context = context
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

function pluralize(locale, pluralization, arguments, number) {
    if (!number) {
        if (pluralization.number) {
            number = arguments[pluralization.number]
            if (!number) {
                error(context +
                    ': no value found for pluralization default number [' + pluralization.number + ']')
            }
        } else {
            error(context +
                ': neither number argument nor default number provided for pluralization')
        }
    }
    let numberClass = locale.classForNumber(number)
    if (!pluralizationKeyNames.has(numberClass)) {
        error(pluralization.context, 'Illegal number class returned from locale ' + locale.name +
            ' for number ' + number)
    }
    if (!pluralization.numberClass) {
        numberClass = pluralizationKeys.other
    }
    return interpolatePluralizationResult(pluralization.numberClass, arguments, number)
}

function interpolatePluralizationResult(pluralization.numberClass, arguments, number) {
    // TODO
}

function log(context, value) {
    console.log(context + ': ' + value)
}

function error(context, message) {
    throw new Error(context + ': ' + message)
}

readLocalization()
