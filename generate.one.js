/**
 * Wiki generator for Wikipedia and uses Tailwind
 *
 * see documentation: https://docs.google.com/document/d/1Eo5LC7siJOEopiXM_NLa51H0-6Bl36aGeEnQYihJDGU/edit?usp=sharing
 * version 2.0  dd 2021-12-30
 */


const WikiConnect = require('./lib/wiki-connect')
const Fs = require('fs');
const Path = require('path');
const MergeEngine = require('./lib/merge-engine');
const Config = require('config');
const CircularJSON = require('circular-json')


const optionDefinitions = [
  { name: 'silent', alias: 's', type: Boolean },
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'name', alias: 'n', type: String },
  { name: 'key', alias: 'k', type: String },
  { name: 'output', alias: 'o', type: String},
  { name: 'template', alias: 't', type: String},
  { name: 'directory', alias: 'd', type: String},
  { name: 'image', alias: 'i', type: String},
  { name: 'json', alias: 'j', type: Boolean},
  { name: 'retrieve', alias: 'r', type: Boolean},
]

const commandLineArgs = require('command-line-args')
const util = require("util");
let options;
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  console.error(e.message)
  return(1)
}

const say = function(msg) {
  if (!options.silent) {
    console.log(msg)
  }
}



const defaults = {
  name: 'Nan Hoover',
  key: 'Q1964408',
  rootDirectory: __dirname,
  template: 'templates/body.shtml',
  output: 'temp/output.html',
  image: 'temp',
  json: false,
  retrieve: false,
}
const changeExtension = function(file, extension) {
  const basename = Path.basename(file, Path.extname(file))
  return Path.join(Path.dirname(file), basename + extension)
}

const initOptions = function() {

  if (options.name) {
    defaults.name = options.name
  }
  if (options.key) {
    defaults.key = options.key
  }
  if (options.rootDirectory) {
    defaults.rootDirectory = options.rootDirectory
  }
  if (options.template) {
    defaults.template = options.template
  }
  if (defaults.template.substr(0,1) !== '/') {
    defaults.template = Path.join(defaults.rootDirectory, defaults.template)
  }
  if (!Fs.existsSync(defaults.template)) {
    throw new Error(`the file ${defaults.template} does not exist`)
  }
  if (options.output) {
    defaults.output = options.output
  }
  if (defaults.output.substr(0,1) !== '/') {
    defaults.output = Path.join(defaults.rootDirectory, defaults.output)
  }
  if (options.image) {
    defaults.image = options.image
  }
  if (defaults.image.substr(0,1) !== '/') {
    defaults.image = Path.join(defaults.rootDirectory, defaults.image)
  }
  if (!Fs.existsSync(defaults.image)) {
    Fs.mkdirSync(defaults.image);
  }
  if (!Fs.existsSync(Path.dirname(defaults.output))) {
    Fs.mkdirSync(Path.dirname(defaults.output));
  }
  if (options.json) {
    defaults.json = changeExtension(defaults.output, '.json')
  }
  if (options.retrieve) {
    defaults.retrieve = !!options.retrieve
  }
  say('generate one artist biography version 0.3');
  if (options.help) {
    console.log('usage: node generate.one.js {options}')
    console.log('options:');
    console.log(' -h (help) this page')
    console.log(' -s (silent) do not display any message (default: 0)')
    console.log(' -n (name) the name of the artist (default: Nan Hoover)')
    console.log(' -k (key) the key of the user (default: Q1964408)')
    console.log(' -d (directory) the root directory (default: current directory)')
    console.log(' -t (template) the filename of the template, relative to directory (default: templates/body.shtml)')
    console.log(' -o (output) the of the generated file (default: temp/output.html)')
    console.log(' -i (image) the directory for the images (default: temp)')
    console.log(' -j (json) store the generated json file (default: temp/output.json)');
    console.log(' -r (retrieve) force the retrieve from the wikipedia (default: 0)')
    process.exit(0)
  }
  say(`template: ${defaults.template}`);
  say(`output: ${defaults.output}`);
  say(`images: ${defaults.image}`);
  if (defaults.json) {
    say(`json: ${defaults.json}`)
  }
}

let runGenerate = async function() {
  initOptions();
  let blockList = Config.has('blockList') ? Config.get('blockList') : [];
  let wikiConnect = new WikiConnect.Wiki({
    blockList,
    imagePath: defaults.image
  });
  let mergeEngine = new MergeEngine();
  mergeEngine.templateFile = defaults.template; // Path.join(__dirname, 'templates', 'biography.body.template.html')
  // let indexPage = '';
  // let rootDir = Path.join(__dirname, 'templates');
  let json;
  if (defaults.retrieve || !Fs.existsSync(changeExtension(defaults.output, '.json'))) {
    json = await wikiConnect.artistByQId(defaults.key, defaults.name)
  } else {
    json = JSON.parse(Fs.readFileSync(changeExtension(defaults.output, '.json')))
  }
  mergeEngine.mergeToFile(json, defaults.output)
  if (defaults.json) {
    say(`json: ${defaults.json}`)
    Fs.writeFileSync(defaults.json, CircularJSON.stringify(json, null, 1))
  }
  return 'document generated';
}

// let runDump = async function runDump() {
//   let blockList = Config.has('blockList') ? Config.get('blockList') : [];
//   let wikiConnect = new WikiConnect.Wiki({blockList});
//   let mergeEngine = new MergeEngine();
//   mergeEngine.templateFile = Path.join(__dirname, 'templates', 'biography.body.template.html')
//   let indexPage = '';
//   let rootDir = Path.join(__dirname, 'templates');
//
//   console.log(`dumping test files to ${rootDir}`);
//
//   for (let index = 0; index < QId.length; index++) {
//     if (QId[index].key) {
//       indexPage += `<li><a href="${QId[index].key}.html">"${QId[index].name} <small>(id: ${QId[index].key})</small></a></li>`
//       let result = await wikiConnect.artistByQId(QId[index].key, QId[index].name)
//       mergeEngine.mergeToFile(result, Path.join(rootDir, `body.html`))
//       // let data = convert(QId[index].name, result)
//       // Fs.writeFileSync(Path.join(rootDir, `${QId[index].key}.html`), data);
//       Fs.writeFileSync(Path.join(rootDir, 'bio.json'), CircularJSON.stringify(result, null, 1))
//       console.log(`written: ${Path.join(rootDir, 'body.html')} and json: ${Path.join(rootDir, 'bio.json')} `)
//     } else {
//       indexPage += `<li>${QId[index].name} (no biography)</li>`
//     }
//   }
//   console.log('done')
// }
//
// function convert(name, data) {
//   let result;
//   if (data.error) {
//     result = `<p>ERROR: <b>${data.error}</b></p>`
//   } else {
//     result = `<h2><a href="${data.wikiUrl}" target="_blank">Wiki page: ${data.wikiUrl}</a>`
//   }
//   if (data.bio) {
//     for (let secIndex = 0; secIndex < data.bio.length; secIndex++) {
//       let sec = data.bio[secIndex]
//       let s = ''
//       if (sec.title) {
//         s += `<h2>${sec.title}</h2>\n`;
//       }
//       for (let parIndex = 0; parIndex < sec.paragraphs.length; parIndex++) {
//         s += '<p>\n';
//         for (let senIndex = 0; senIndex < sec.paragraphs[parIndex].length; senIndex++) {
//           let sen = sec.paragraphs[parIndex][senIndex];
//           if (!sen.format) {
//             s += `${sen.text}\n`
//           } else {
//             let tmp = sen.text;
//             for (let formatIndex = 0; formatIndex < sen.format.length; formatIndex++) {
//               tmp = tmp.replace(sen.format[formatIndex], `<i>${sen.format[formatIndex]}</i>`)
//             }
//             s += tmp;
//           }
//         }
//         s += '</p>\n'
//       }
//       result += s + '\n';
//     }
//   }
//   return `<html><body style="font-family: 'Arial"><p><a href="index.html">back</a></p><h1>${name}</h1>\n${result}</body></html>`
//   // return JSON.stringify(data)
// }

util.promisify(runGenerate)
runGenerate()
  .then(x => {
    say(x)
    process.exit(0)
  })
  .catch(e => {
    console.log(`[Error]: ${e.message}`)
    process.exit(1)
  })
