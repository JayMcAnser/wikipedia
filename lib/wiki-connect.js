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
const Wtf = require('../wtf_wikipedia/src/index')

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
          data.rawBio = doc; // doc.json();  json() remove the list definition from the sentence!!
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
    let sections = raw._sections;
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
    let paragraphs = sec._paragraphs;
    if (! paragraphs || paragraphs.length === 0) {
      return false; // skip empty
    }

    let result = []
    for (let index = 0; index < paragraphs.length; index++) {
      let d = this.analyseParagraph(paragraphs[index])
      if (d) {
        let list = this.analyseList(paragraphs[index])
        if (list) {
          result.push({
            sentences: d,
            lists: list
          });
        } else {
          result.push({
            sentences: d
          })
        }
      }
    }
    if (result.length) {
      if (sec._title) {
        return {
          title: sec._title,
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
}



module.exports.default = WikiConnect;
module.exports = {
  Wiki: WikiConnect,
  WIKE_EN_URL: WIKI_EN_URL
}
