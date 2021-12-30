
const WikiConnect = require('./lib/wiki-connect')
const Fs = require('fs');
const Path = require('path');
const MergeEngine = require('./lib/merge-engine');
const Config = require('config');
const Util = require('util');

const optionDefinitions = [
  { name: 'name', alias: 'n', type: String },
  { name: 'id', alias: 'i', type: String },
  { name: 'file', alias: 'f', type: String},
  { name: 'directory', alias: 'd', type: String},
  { name: 'template', alias: 't', type: String},
  { name: 'silent', alias: 's', type: Boolean },
  { name: 'help', alias: 'h', Boolean },
]

const commandLineArgs = require('command-line-args')
const util = require("util");
let options;
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  console.error(e.message)
  process.exit()
}

if (options.help) {
  console.log('usage: node generate.one.js')
  console.log('options:');
  console.log(' -n (name) {name} the name artist (default: Nan Hoover)')
  console.log(' -k (key) {wikipedia id} the wikipedia id (default Q1964408)')
  console.log(' -t (template) the template file to use relative to the root (default: templates/body.shtml)');
  console.log(' -d (directory) the root directory to use. (default: current directory)')
  console.log(' -f (filename) the name of the file to generate (default: temp/output.html)')
  console.log(' -s (silent) do not display info')
  console.log(' -h (help) this message')
  process.exit()
}

const say = function(msg) {
  if (!options.silent) {
    console.log(msg)
  }
}

let QId = [
  {name: 'Nan Hoover', key: 'Q1964408'},
]

let defaults = {
  name: 'Nan Hoover',
  key: 'Q1964408',
  rootDirectory: __dirname,
  template: 'templates/body.shtml',
  fileName: 'temp/output.html'
}

/**
 * get the info from the command line
 */
let initArtists = function() {
  say('Generate test html for the wikipedia version 0.2\n')
  if (options.name) {
    defaults.name = options.name
  }
  if (options.key) {
    defaults.key = options.key
  }
  if (options.directory) {
    defaults.rootDirectory = options.directory
  }
  if (options.template) {
    defaults.template = options.template
  }
  if (defaults.template.substr(0,1) !== '/') {
    defaults.template = Path.join(__dirname, defaults.template)
  }

  if (options.file) {
    defaults.fileName = options.file
  }
  if (defaults.fileName.substr(0,1) !== '/') {
    defaults.fileName = Path.join(__dirname, defaults.fileName)
  }
  say(`using template: ${defaults.template}`);
  say(`output: ${defaults.fileName}`);
  say(`importing: ${defaults.name}, key: ${defaults.key}`)
}

let runGenerate = async function runDump() {
  initArtists()
  let blockList = Config.has('blockList') ? Config.get('blockList') : [];
  let wikiConnect = new WikiConnect.Wiki({blockList});
  let mergeEngine = new MergeEngine();
  mergeEngine.templateFile = defaults.template; // Path.join(__dirname, 'templates', 'biography.body.template.html')

  let result = await wikiConnect.artistByQId(defaults.key, defaults.name)
  mergeEngine.mergeToFile(result, defaults.fileName)
  // let data = convert(QId[index].name, result)
  // Fs.writeFileSync(Path.join(rootDir, `${QId[index].key}.html`), data);
  // Fs.writeFileSync(Path.join(rootDir, 'bio.json'), JSON.stringify(result, null, 1))


  // for generating a lot of info
  // for (let index = 0; index < QId.length; index++) {
  //   if (QId[index].key) {
  //     indexPage += `<li><a href="${QId[index].key}.html">"${QId[index].name} <small>(id: ${QId[index].key})</small></a></li>`
  //     let result = await wikiConnect.artistByQId(QId[index].key, QId[index].name)
  //     mergeEngine.mergeToFile(result, Path.join(rootDir, `body.html`))
  //     // let data = convert(QId[index].name, result)
  //     // Fs.writeFileSync(Path.join(rootDir, `${QId[index].key}.html`), data);
  //     Fs.writeFileSync(Path.join(rootDir, 'bio.json'), JSON.stringify(result, null, 1))
  //     console.log(`written: ${Path.join(rootDir, 'body.html')} and json: ${Path.join(rootDir, 'bio.json')} `)
  //   } else {
  //     indexPage += `<li>${QId[index].name} (no biography)</li>`
  //   }
  // }
  // console.log('done')
  return 'file generated'
}

function convert(name, data) {
  let result;
  if (data.error) {
    result = `<p>ERROR: <b>${data.error}</b></p>`
  } else {
    result = `<h2><a href="${data.wikiUrl}" target="_blank">Wiki page: ${data.wikiUrl}</a>`
  }
  if (data.bio) {
    for (let secIndex = 0; secIndex < data.bio.length; secIndex++) {
      let sec = data.bio[secIndex]
      let s = ''
      if (sec.title) {
        s += `<h2>${sec.title}</h2>\n`;
      }
      for (let parIndex = 0; parIndex < sec.paragraphs.length; parIndex++) {
        s += '<p>\n';
        for (let senIndex = 0; senIndex < sec.paragraphs[parIndex].length; senIndex++) {
          let sen = sec.paragraphs[parIndex][senIndex];
          if (!sen.format) {
            s += `${sen.text}\n`
          } else {
            let tmp = sen.text;
            for (let formatIndex = 0; formatIndex < sen.format.length; formatIndex++) {
              tmp = tmp.replace(sen.format[formatIndex], `<i>${sen.format[formatIndex]}</i>`)
            }
            s += tmp;
          }
        }
        s += '</p>\n'
      }
      result += s + '\n';
    }
  }
  return `<html><body style="font-family: 'Arial"><p><a href="index.html">back</a></p><h1>${name}</h1>\n${result}</body></html>`
  // return JSON.stringify(data)
}

util.promisify(runGenerate)
runGenerate().then(x => {
  say(x);
  process.exit(0)
}).catch(e => {
  console.log(`[Error] ${e.message}`)
})
