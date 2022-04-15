var fs = require('fs');
var path = require('path');

const chrome_folder = '../chrome_extension';
const target_file_name = 'index.js';
const target_file_name_map = 'index.js';
const source_file = './dist/index.js';

let content = fs.readFileSync(source_file, 'utf-8');
fs.writeFileSync(path.join(chrome_folder, target_file_name), content, 'utf-8');
fs.writeFileSync(path.join(chrome_folder, `index.js.map`), fs.readFileSync('./dist/index.js.map', 'utf-8'), 'utf-8');