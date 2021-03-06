
const WikiConnect = require('./lib/wiki-connect')
const Fs = require('fs');
const Path = require('path');
const MergeEngine = require('./lib/merge-engine');
const Config = require('config');



let QId = [

  {name: 'Marina Abramovic', key: 'Q47496'},
  {name: 'stanley brouwn', key: 'Q874901'},
  {name: 'Nan Hoover', key: 'Q1964408'},
  {name: 'Constant Dullaart', key: 'Q19665830'},

  {name: 'Trevor Batten', key: 'Q52840351'},
  {name: 'Ulay', key: 'Q69562'},
  {name: 'General Idea', key: 'Q283498'},
  {name: 'Abramovic/Ulay', key: 'Q29939705'},
  {name: 'Corinna Smid', key: 'Q35828924'},
  {name: 'Yvonne Oerlemans'},
  {name: 'Marinus Boezem', key: 'Q477388'},
  {name: 'Melanie Bonajo', key: 'Q24049112'},
  {name: 'Julika Rudelius', key: 'Q19663781'},

  {name: 'Anouk De Clercq', key: 'Q19587492'},
  {name: 'Ant Farm', key: 'Q317874'},
  {name: 'Esther Polak', key: 'Q19587594'},
  {name: 'Julika Rudelius', key: 'Q19663781'},
  {name: 'belit sağ', key: 'Q50345560'},
  {name: 'Francis Alys', key: 'Q558288'},
  {name: 'Hank Bull', key: 'Q24262352'},
  {name: 'Livinus van de Bundt', key: 'Q2162448'},
  {name: 'Livinus and Jeep van de Bundt', key: 'Q62392767'},
]

let runDump = async function runDump() {
  let blockList = Config.has('blockList') ? Config.get('blockList') : [];
  let wikiConnect = new WikiConnect.Wiki({blockList});
  let mergeEngine = new MergeEngine();
  mergeEngine.templateFile = Path.join(__dirname, 'templates', 'preview.html')
  let indexPage = '';
  let rootDir = Path.join(__dirname, 'data');

  console.log(`dumping test files to ${rootDir}`);

  for (let index = 0; index < QId.length; index++) {
    if (QId[index].key) {
      indexPage += `<li><a href="${QId[index].key}.html">"${QId[index].name} <small>(id: ${QId[index].key})</small></a></li>`
      let result = await wikiConnect.artistByQId(QId[index].key, QId[index].name)
      mergeEngine.mergeToFile(result, Path.join(rootDir, `${QId[index].key}.html`))
      // let data = convert(QId[index].name, result)
      // Fs.writeFileSync(Path.join(rootDir, `${QId[index].key}.html`), data);
    } else {
      indexPage += `<li>${QId[index].name} (no biography)</li>`
    }
    process.stdout.write('.')
  }

  indexPage = `<html><meta charset="UTF-8"><link rel="stylesheet" href="style.css"><body><h1>Test biography</h1><ul>${indexPage}</ul></p></body></html>`
  Fs.writeFileSync(Path.join(rootDir, `index.html`), indexPage);
  console.log('done')
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

runDump()
