/**
 * Connector the with wikipedia and wiki data
 * version 0.0.1 Jay 2021-07-08
 *
 * Tested by list of: https://docs.google.com/document/d/1QdHh79eENXyRYyYKHDG2IJfws08Kvp-A5Lx3eemKs1o/edit
 */
const WBK = require('wikibase-sdk')
const WIKI_EN_URL = 'P4656'
const Axios = require('axios');
const Connect = require('./connect');
const Wtf = require('wtf_wikipedia')

class WikiConnect {
  constructor(
    options = {}
              ) {
    this.instance = options.hasOwnProperty('instance') ? options.instance : 'https://www.wikidata.org';
    this.sparql = options.hasOwnProperty('sparql') ? options.sparql : 'https://query.wikidata.org/sparql';
    this.rootUrl = 'https://www.wikidata.org/';
    // this.idToInfo = 'w/api.php?action=wbgetentities&languages=en&format=json&ids='
    // props=sitelinks
    this.idToInfo = 'w/api.php?action=wbgetentities&languages=en&format=json&props=sitelinks/urls&ids='
    this.wdk = WBK({
      instance: this.instance,
      sparqlEndpoint: this.sparql
    })
  }

  /**
   * convert a qId to an structure that defines the artist
   * @param qId String the Wiki id
   * @param name String the name according to Mediakunst
   */
  async artistByQId(qId, name) {
    let result
    let url
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
    let bio = this.analyseData(result.data.entities[qId])
    if (name) {
      bio.artistName = name
    }
    await this.getBio(bio)
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
        result.error = 'missing link to biography'
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
          data.rawBio = doc.json();
          data.bio = this.cleanBio(data.rawBio)
        }
      } catch(e) {
        Connect.log('error', e.message, 'wiki-connect.getBio')
        throw new Error('[wiki-connect.error]', e.message)
      }
      console.log(doc)
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
    let sections = raw.sections;
    let result = []
    for (let index = 0; index < sections.length; index++) {
      let sec = raw.sections[index];
      // section must have atleast 1 paragraph
      let res = this.analyseSection(sec);
      if (res) {
        result.push(res)
      }
    }
    return result;
  }

  analyseSection(sec) {
    if (!sec.hasOwnProperty('paragraphs') || sec.paragraphs.length === 0) {
      return false; // skip empty
    }
    if (sec.lists && (sec.lists.length && sec.paragraphs.length < 2)) {
      for (let index = 0; index < sec.lists.length; index++) {
        if (sec.lists[index].length > 1) {
          return false
        }
      }
    }
    let result = []
    for (let index = 0; index < sec.paragraphs.length; index++) {
      let d = this.analyseParagraph(sec.paragraphs[index])
      if (d) {
        result.push(d)
      }
    }
    if (result.length) {
      if (sec.title) {
        return {
          title: sec.title,
          paragraphs: result
        }
      }
      return {
        paragraphs: result
      };
    }
    return false
  }

  analyseParagraph(par) {
    if (!par.sentences || par.sentences.length === 0) {
      return false;
    }
    let result = [];
    for (let index = 0; index < par.sentences.length; index++) {
      let sen = par.sentences[index]
      if (! sen.text || sen.text.trim().length === 0) {
        continue;
      }
      let sentence = {
        text: sen.text.trim()
      };
      if (sen.formatting && sen.formatting.italic) {
        sentence.format = sen.formatting.italic;  // the string to replace with <i>xxxx</i>
      }
      result.push(sentence);
    }
    return result;
  }
}



module.exports.default = WikiConnect;
module.exports = {
  Wiki: WikiConnect,
  WIKE_EN_URL: WIKI_EN_URL
}
