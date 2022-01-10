/**
 * interface to the outside world
 *
 * version 1.0 2021-07-10 @Jay
 * version 1.1 2021-12-12 @Jay added options.imageProcess so images can be reprocessed
 * version 1.2 2022-01-06 @Jay change basic config
 *      -- options: {
 *        blockReplace: {bold : {openTag/closeTag}, italic}
 *      }
 */


const WikiConnect = require('./lib/wiki-connect');
const MergeEngine = require('./lib/merge-engine');
const ImageProcess = require('./lib/image-process')
/**
 * retrieve a JSON record
 * @param qId String the qId of the artist
 * @param name String the offical name of the artist
 * @param options Object info send to the wiki connector
 * @return {Promise<JSON>}
 */
const qIdToJson = function(qId, name, options = {}) {
  let wiki = new WikiConnect.Wiki(options);
  return wiki.artistByQId(qId, name)
}

/**
 * merge the biography i
 *
 * @param qId String
 * @param name String Artist name
 * @param fileName String full path to the template. If missing ./templates/preview.html is used
 * @param options Object
 * @return Promise<String>
 */
const mergeFileName =  async function(qId, name, fileName, options = {}) {
  let json = await qIdToJson(qId, name, options);
  let mergeEngine = new MergeEngine(options);
  mergeEngine.templateFile = fileName ? fileName : Path.join(rootDir, 'templates', 'preview.html');
  return mergeEngine.merge(json)
}
/**
 * merge a biography by a template filename
 * @param qId String
 * @param name String
 * @param template String
 * @param options Object
 * @return Promise<string>
 */
const mergeTemplate = async function(qId, name, template, options = {}) {
  let json = await qIdToJson(qId, name, options);
  let mergeEngine = new MergeEngine(options);
  mergeEngine.template = template;
  return mergeEngine.merge(json)
}

const merge = async function(json, template, isFile = true, options= {}) {
  let mergeEngine = new MergeEngine();
  if (isFile) {
    mergeEngine.templateFile = template
  } else {
    mergeEngine.template = template;
  }
  return mergeEngine.merge(json)
}


module.exports = {
  version: require('./package.json').version,
  qIdToJson: qIdToJson,
  mergeTemplate: mergeTemplate,
  mergeFileName: mergeFileName,
  merge: merge,
  ImageProcess
}
