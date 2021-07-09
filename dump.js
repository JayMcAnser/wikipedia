
const WikiConnect = require('./lib/wiki-connect')
const Fs = require('fs');
const Path = require('path');
const MergeEngine = require('./lib/merge-engine');


console.log('dumping test files');

let QId = [
  {name: 'Marina Abramovic', key: 'Q47496'},
  {name: 'Abramovic/Ulay', key: 'Q29939705'},
  {name: 'Ulay', key: 'Q69562'},
  {name: 'Corinna Smid', key: 'Q35828924'},


  {name: 'General Idea', key: 'Q283498'},
  {name: 'Yvonne Oerlemans'},
  {name: 'Marinus Boezem', key: 'Q477388'},
  {name: 'Trevor Batten', key: 'Q52840351'},
  {name: 'Constant Dullaart', key: 'Q19665830'},
  {name: 'Nan Hoover', key: 'Q1964408'},
  {name: 'Melanie Bonajo', key: 'Q24049112'}

]

let runDump = async function runDump() {
  let wikiConnect = new WikiConnect.Wiki();
  let mergeEngine = new MergeEngine();
  mergeEngine.templateFile = Path.join(__dirname, 'templates', 'preview.html')
  let indexPage = '';
  let rootDir = Path.join(__dirname, 'data');
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

  }

  indexPage = `<html><body style="font-family: 'Arial"><h1>Test biography</h1><p>version 1.0, dd 2021-07-08</p><ul>${indexPage}</ul></p></body></html>`
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
