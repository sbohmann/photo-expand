const fs = require('fs')
const yaml = require('js-yaml')

let content = yaml.load(fs.readFileSync('example.en.yaml', 'utf-8'))
console.log(JSON.stringify(content, undefined, 2))
console.log('[' + content.localization.years_on_hills.result + ']')