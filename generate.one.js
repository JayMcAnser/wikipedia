
const WikiConnect = require('./lib/wiki-connect')
const Fs = require('fs');
const Path = require('path');
const MergeEngine = require('./lib/merge-engine');
const Config = require('config');




let QId = [
  {name: 'Nan Hoover', key: 'Q1964408'},
]

let runDump = async function runDump() {
  let blockList = Config.has('blockList') ? Config.get('blockList') : [];
  let wikiConnect = new WikiConnect.Wiki({blockList});
  let mergeEngine = new MergeEngine();
  mergeEngine.templateFile = Path.join(__dirname, 'templates', 'biography.body.template.html')
  let indexPage = '';
  let rootDir = Path.join(__dirname, 'templates');

  console.log(`dumping test files to ${rootDir}`);

  for (let index = 0; index < QId.length; index++) {
    if (QId[index].key) {
      indexPage += `<li><a href="${QId[index].key}.html">"${QId[index].name} <small>(id: ${QId[index].key})</small></a></li>`
      let result = await wikiConnect.artistByQId(QId[index].key, QId[index].name)
      mergeEngine.mergeToFile(result, Path.join(rootDir, `body.html`))
      // let data = convert(QId[index].name, result)
      // Fs.writeFileSync(Path.join(rootDir, `${QId[index].key}.html`), data);
      Fs.writeFileSync(Path.join(rootDir, 'bio.json'), JSON.stringify(result, null, 1))
      console.log(`written: ${Path.join(rootDir, 'body.html')} and json: ${Path.join(rootDir, 'bio.json')} `)
    } else {
      indexPage += `<li>${QId[index].name} (no biography)</li>`
    }
  }
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

console.log('generate one biography');
console.log('write the file body.html into the template directory');
console.log('and uses the biography.body.template.html as definition')
runDump()
