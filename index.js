/**
 * interface to the outside world
 *
 * version 1.0 2021-07-10 @Jay
 */


const WikiConnect = require('./lib/wiki-connect');
const MergeEngine = require('./lib/merge-engine');
/**
 * retrieve a JSON record
 * @param qId String the qId of the artist
 * @return {Promise<JSON>}
 */
const qIdToJson = function(qId, name) {
  let wiki = new WikiConnect.Wiki();
  return wiki.artistByQId(qId, name)
}

/**
 * merge the biography i
 *
 * @param qId String
 * @param name String Artist name
 * @param fileName String full path to the template. If missing ./templates/preview.html is used
 * @return Promise<String>
 */
const mergeFileName =  async function(qId, name, fileName) {
  let json = await qIdToJson(qId, name);
  let mergeEngine = new MergeEngine();
  mergeEngine.templateFile = fileName ? fileName : Path.join(rootDir, 'templates', 'preview.html');
  return mergeEngine.merge(json)
}
/**
 * merge a biography by a template filename
 * @param qId String
 * @param name String
 * @param template String
 * @return Promise<string>
 */
const mergeTemplate = async function(qId, name, template) {
  let json = await qIdToJson(qId, name);
  let mergeEngine = new MergeEngine();
  mergeEngine.template = template;
  return mergeEngine.merge(json)
}

module.exports = {
  version: require('./package.json').version,
  qIdToJson: qIdToJson,
  mergeTemplate: mergeTemplate,
  mergeFileName: mergeFileName
}
