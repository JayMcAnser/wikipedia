const Path = require("path");
const Fs = require("fs");
const Axios = require("axios");
const Hashes = require("jshashes");

/**
 * class to process the image from the wikipedia
 *
 * version 1.0 @Jay 2021-12-12
 */

class ImageProcess {
  constructor(options = {}) {
    this.wikiImageServer = options.hasOwnProperty('wikiImageServer') && options.wikiImageServer ? options.wikiImageServer : 'https://upload.wikimedia.org/wikipedia/commons/'
    this.errors = [];
    this.imagePath = options.imagePath ? options.imagePath : __dirname
  }

  /**
   * overloadable function
   * @param requestInfo String the name of the fil
   * @return Stream the stream to write the data to
   */
  createWriteStream(requestInfo) {
    // let path = Path.join(this.imagePath, name, extension);
    // check that the directory exists
    if (!Fs.existsSync(this.imagePath) && !Fs.mkdirSync(this.imagePath, {recursive: true})) {
      this.pushError('error', `can not create directory ${this.imagePath}`)
      return false;
    }
    requestInfo.fullPath = Path.join(this.imagePath, requestInfo.filename)
    if (Fs.existsSync(requestInfo.fullPath)) {
      Fs.unlinkSync(requestInfo.fullPath)
    }
    return Fs.createWriteStream(requestInfo.fullPath);
  }

  /**
   * generate a stream from the wiki server
   * @param requestInfo
   * @return {Promise<AxiosResponse<any>>}
   */
  async readImageStream(requestInfo) {
    return await Axios({
      url: requestInfo.url,
      method: 'GET',
      responseType: 'stream'
    })
  }

  /**
   * pre retrieving the image
   * @param image Object: readStream, writeStream, url, filename
   * @return {Promise<void>}
   */
  async initImageRetrieve(image) {
    return Promise.resolve()
  }


  /**
   * called after all has been downloaded an written
   * @param image Object: readStream, writeStream, url, filename
   * @return {Promise<void>}
   */
  async imageDone(image) {
    return Promise.resolve()
  }
  /**
   * encode the file name to the weird Wikipedia definition
   *
   * @param fileName
   * @return String full URL to the image
   * @private
   */
  _urlEncode(fileName) {
    //the wikimedia image url is a little silly:
    //https://commons.wikimedia.org/wiki/Commons:FAQ#What_are_the_strangely_named_components_in_file_paths.3F
    let title = fileName.split(' ').join('_');
    let hash = new Hashes.MD5().hex(title)
    let path = hash.substr(0, 1) + '/' + hash.substr(0, 2) + '/'
    title = encodeURIComponent(title)
    path += title
    return this.wikiImageServer + path
  }

  pushError(status, message, action) {
    this.errors.push({status, message, action})
  }
  /**
   * retrieve the images reference in the bio.
   * the first one should be used !!
   * @param raw object the data retrieved from the wikidata endpoint
   * @param all Boolean if true all images are loaded, but only the first on is cached!
   * @return Array of Images
   *     * filename String
   *     * stream: Stream
   */
  async getImages(raw, all = false) {
    let result = []
    this.errors = []
    if (raw.hasOwnProperty('claims') && raw.claims.hasOwnProperty('P18')) {
      for (let index = 0; index < raw.claims.P18.length; index ++) {
        let imageDef = {}
        try {
          imageDef.url = this._urlEncode(raw.claims.P18[index].mainsnak.datavalue.value)
          imageDef.filename = `${raw.title}${index > 0 ? '.' + index : ''}${ Path.extname(imageDef.url)}`.toLowerCase()
          result.push(imageDef)
          if (!all) {
            break; // we only want one image
          }
        } catch(e) {
          this.pushError('error', `unknown image: ${e.message}`, 'fail')
        }
      }
      // the first one is the image to download
      if (result.length > 0) {
        result[0].writeStream = this.createWriteStream(result[0])
        // let path = Path.join(this.imagePath, raw.title + Path.extname(result[0]));
        // if (Fs.existsSync(path)) {
        //   Fs.unlinkSync(path)
        // }
        // let writer = Fs.createWriteStream(path);
        // let response = await Axios({
        //   url: result[0],
        //   method: 'GET',
        //   responseType: 'stream'
        // })
        result[0].readStream =  await this.readImageStream(result[0])
        await this.initImageRetrieve(result[0])
        result[0].readStream.data.pipe(result[0].writeStream);
        let vm = this;
        return new Promise( (resolve) => {
          result[0].writeStream.on('finish', async() => {
            await vm.imageDone(result[0])
            resolve(result)
          })
          result[0].writeStream.on('error', function () {
            vm.pushError( 'error', `failed to retrieve ${result[0]}`, 'fail')
            // this.logger('warn', `failed to retrieve ${result[0]}`, 'wiki-connect.getImages')
            return [];
          })
        })
      }
    }
    return result;
  }
}

module.exports = ImageProcess
