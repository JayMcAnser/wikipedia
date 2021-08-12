/**
 * Connector the with wikipedia and wiki data
 * version 0.0.1 Jay 2021-07-08
 *
 * Tested by list of: https://docs.google.com/document/d/1QdHh79eENXyRYyYKHDG2IJfws08Kvp-A5Lx3eemKs1o/edit
 */
//const WBK = require('wikibase-sdk')
const WIKI_EN_URL = 'P4656'
const Axios = require('axios');
const Connect = require('./connect');
const Config = require('config');
const Wtf = require('wtf_wikipedia');
const Hashes = require('jshashes')
const Path = require('path');
const Fs = require('fs');

class WikiConnect {
  constructor(
    options = {}
              ) {
    this.instance = options.hasOwnProperty('instance') ? options.instance : 'https://www.wikidata.org';
    this.rootUrl = options.hasOwnProperty('rootUrl')? options.rootUrl : 'https://www.wikidata.org/';
    this.idToInfo = Config.get('url.idToInfo') // 'w/api.php?action=wbgetentities&languages=en&format=json&props=sitelinks/urls&ids='
    this.idToImage = Config.get('url.idToImage'); // 'w/api.php?action=wbgetentities&languages=en&format=json&ids='
    this.imagePath = options.hasOwnProperty('imagePath') ? options.imagePath : Config.get('path.images');
    this.logger = options.hasOwnProperty('logger') ? options.logger : this._log

    // -------
    // the title of the section auto removed
    this.blockList = [];
    let list = options.hasOwnProperty('blockList') ? options.blockList : []
    for (let index = 0; index < list.length; index++) {
      this.blockList[index] = list[index].split(' ').join('');
    }
  }

  /**
   * fake logger to the console
   *
   * @param type
   * @param message
   * @param where
   * @private
   */
  _log(type, message, where) {
    console[type](`${where}: ${message}`)
  }
  /**
   * convert a qId to an structure that defines the artist
   * @param qId String the Wiki id
   * @param name String the name according to Mediakunst
   */
  async artistByQId(qId, name) {
    let result
    let url;
    let bio;
    try {
      url = `${this.rootUrl}${this.idToInfo}${qId}`;
      result = await Axios.get(url)
    } catch (e) {
      Connect.log('error', e.message, 'wiki-connect.artistById')
      throw new Error('[wiki-connect.error]', e.message)
    }

    if (result.status !== 200) {
      Connect.log('warn', `artist ${qId} returns an error: ${result.statusText}`, 'wiki-connect.artistById')
      throw new Error('artist error')
    }
    if (result.data.error) {
      return {
        error: result.data.error.info
      }
    } else {
      bio = this.analyseData(result.data.entities[qId])
      if (name) {
        bio.artistName = name
      }
      await this.getBio(bio)

    }

    // retrieve the image

    try {
      url = `${this.rootUrl}${this.idToImage}${qId}`;
      result = await Axios.get(url)
    } catch (e) {
      Connect.log('error', e.message, 'wiki-connect.artistById.image')
      return bio
    }
    if (result.status !== 200) {
      Connect.log('warn', `artist ${qId} returns an error: ${result.statusText}`, 'wiki-connect.artistById.image2')
      return bio
    }
    if (result.data.error) {
     return bio;
    }
    bio.images = await this.getImages(result.data.entities[qId])
    return bio;
  }

  /**
   * analyse the data so we get the fields we need
   * @param raw
   */
  analyseData(raw) {
    if (!raw) {
      Connect.log('warn', 'no artist info')
      throw new Error('no artists info found')
    }
    let result = {};
    // the the url out of it
    if (raw.hasOwnProperty('sitelinks')) {
      if (raw.sitelinks.hasOwnProperty('enwiki')) {
        result.wikiUrl = raw.sitelinks.enwiki.url;
      } else {
        result.error = 'There is no english biography page defined in the WikiData'
      }
    }
    return result;
  }

  /**
   * retrieve the biography from the wikipedia
   * @param data
   * @return {Promise<void>}
   */
  async getBio(data) {

    if (data.wikiUrl) {
      let doc;
      try {
        doc = await Wtf.fetch(data.wikiUrl)
        if (doc) {
          // data.rawBio = doc; // doc.json();  json() remove the list definition from the sentence!!
          data.bio = this.cleanBio(doc)
        }
      } catch(e) {
        Connect.log('error', e.message, 'wiki-connect.getBio')
        throw new Error(`[wiki-connect.error] ${e.message}`)
      }
      //console.log(doc)
    }
    return data;
  }

  /**
   * cleaning the bio:
   *   - removes the section with lots of lists
   *   - remove any linke
   *   - remove any image
   * @param raw
   */
  cleanBio(raw) {
    let sections = raw.data.sections;
    let result = []
    for (let index = 0; index < sections.length; index++) {
      let sec = sections[index];
      // section must have atleast 1 paragraph
      let res = this.analyseSection(sec);
      if (res) {
        if (index === 0) {
          // the first line has a pronouncation in it. Remove it
         res.paragraphs[0].sentences[0].text = res.paragraphs[0].sentences[0].text.replace('(, ; ', '(')
        }
        result.push(res)
      }
    }
    return result;
  }

  analyseSection(sec) {
    let paragraphs = sec.data.paragraphs;
    if (! paragraphs || paragraphs.length === 0) {
      return false; // skip empty
    }
    // check if we have to remove this title

    let title = sec.data.title.split(' ').join('')
    for (let index = 0; index < this.blockList.length; index++) {
      if (title.localeCompare(this.blockList[index], undefined, {sensitivity: 'base'}) === 0) {
        return false;
      }
    }

    let result = []
    for (let index = 0; index < paragraphs.length; index++) {
      let d = this.analyseParagraph(paragraphs[index])
      if (d) {
        let list = this.analyseList(paragraphs[index])
        let parStruct;
        if (list) {
          parStruct = {
            sentences: d,
            lists: list
          };
        } else {
          parStruct = {
            sentences: d
          }
        }
        if (this.cleanQuote(parStruct.sentences)) {
          parStruct.isQuote = true;
        }
        result.push(parStruct);

      }
    }
    if (result.length) {
      if (sec.data.title) {
        return {
          title: sec.data.title,
          paragraphs: result
        }
      }
      return {
        paragraphs: result
      };
    }
    return false
  }

  /**
   * returns true if the paragraph is a quotation
   * @param parArray
   */
  cleanQuote(parArray) {
    const QUOTE_START = '""'
    if (parArray[0].text.substr(0, 2) === QUOTE_START) {
      parArray[0].text = parArray[0].text.substr(2);
      let txt = parArray[parArray.length - 1].text;
      if (txt.endsWith(QUOTE_START)) {
        parArray[parArray.length - 1].text = txt.substr(0, txt.length - 2);
      }
      return true;
    }
    return false;
  }



  analyseParagraph(par) {
    let sentences = par.data.sentences
    if (!sentences || sentences.length === 0) {
      return false;
    }
    let result = [];
    for (let index = 0; index < sentences.length; index++) {
      let sen = sentences[index].data
      if (! sen.text || sen.text.trim().length === 0) {
        continue;
      }
      let sentence = {
        text: sen.text.trim()
      };
      if (sen.fmt) {
        let f = this.analyseFormat(sen.fmt);
        if (f) {
          sentence.format = f;
        }
      }
      // check for quotations
      const QUOTE_START = '""'
      if (sentence.text.substr(0,2) === QUOTE_START) {
        console.log('start')
      }
      result.push(sentence);
    }
    return result;
  }

  analyseList(par) {
    let result = [];
    let lists = par.data.lists;
    if (lists && lists.length) {
      for (let listsIndex = 0; listsIndex < lists.length; listsIndex++) {
        let sentence = {
          items: []
        };
        let list = lists[listsIndex].data;
        for (let itemIndex = 0; itemIndex < list.length; itemIndex++) {
          let line = list[itemIndex].data;
          // remove the irritating 1) or 12) part of an ordered list
          let text = line.text.replace(/[0-9]*\) /g, '').trim()
          if (text[0] === '1') {
            console.log('exit')
          }
          let item =  {
            text: text
          };
          if (line.fmt) {
            let f = this.analyseFormat(line.fmt);
            if (f) {
              item.format = f;
            }
          }
          sentence.items.push(item)
        }
        result.push(sentence)
      }
    }
    if (result.length) {
      return result;
    }
    return false
  }
  analyseFormat(format) {
    let result = {
    };
    if (format.bold && format.bold.length) {
      for (let formatIndex = 0; formatIndex < format.bold.length; formatIndex++) {
        if (!result.bold) {
          result.bold = [format.bold[formatIndex]]
        } else {
          result.bold.push(format.bold[formatIndex]);
        }
      }
    }
    if (format.italic && format.italic.length) {
      for (let formatIndex = 0; formatIndex < format.italic.length; formatIndex++) {
        if (!result.italic) {
          result.italic = [format.italic[formatIndex]]
        } else {
          result.italic.push(format.italic[formatIndex]);
        }
      }
    }
    if (Object.keys(result).length === 0) {
      return false;
    }
    return result
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
    return Config.get('image.server') + path
  }
  /**
   * retrieve the images reference in the bio.
   * the first one should be used !!
   * @param raw
   * @param all Boolean if true all images are loaded, but only the first on is cached!
   * @return Array of images
   */
  async getImages(raw, all = false) {
    let result = []
    if (raw.hasOwnProperty('claims') && raw.claims.hasOwnProperty('P18')) {
      for (let index = 0; index < raw.claims.P18.length; index ++) {
        try {
          let url = this._urlEncode(raw.claims.P18[index].mainsnak.datavalue.value)
          result.push(url)
          if (!all) {
            break; // we only want one image
          }
        } catch(e) {
          console.error(`unknown image: ${e.message}`)
        }
      }
      // the first one is the image to download
      if (result.length > 0) {
        let path = Path.join(__dirname, '..', this.imagePath, raw.title + Path.extname(result[0]));
        if (Fs.existsSync(path)) {
          Fs.unlinkSync(path)
        }
        let writer = Fs.createWriteStream(path);
        let response = await Axios({
          url: result[0],
          method: 'GET',
          responseType: 'stream'
        })
        response.data.pipe(writer);
        return new Promise((resolve) => {
          writer.on('finish', resolve)
          writer.on('error', function () {
            this.logger('warn', `failed to retrieve ${result[0]}`, 'wiki-connect.getImages')
            return [];
          })
        })
      }
    }
    return result;
  }
}



module.exports.default = WikiConnect;
module.exports = {
  Wiki: WikiConnect,
  WIKE_EN_URL: WIKI_EN_URL
}
