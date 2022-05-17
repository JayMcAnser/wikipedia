/**
 * test interface to external worls

 */

const chai = require('chai');
const assert = chai.assert;
const Connector = require('../index');
const Path = require('path')
const Q_ULAY = 'Q69562'

describe('index-connector', function () {

  it('version', () => {
    let version = Connector.version;
    assert.isTrue(version > '0.0.1')
  })

  // it('qId to json', async () => {
  //   let json = await Connector.qIdToJson(Q_ULAY, 'Ulay')
  //   assert.isDefined(json)
  //   assert.isUndefined(json.error)
  //   assert.isDefined(json.wikiUrl);
  //   assert.equal(json.wikiUrl, 'https://en.wikipedia.org/wiki/Ulay')
  //   assert.equal(json.bio.length, 5);
  //   assert.equal(json.bio[1].title, 'Early career');
  //   assert.equal(json.bio[1].paragraphs.length, 1);
  //   // text may differ if changed in the wikipedia
  //   assert.equal(json.bio[1].paragraphs[0].sentences[0].text, 'In the early 1970s, struggling with his sense of "Germanness," Ulay moved to Amsterdam, where he began experimenting with the medium of Polaroid.')
  // });

  it('qId does not exist', async() => {
    let json = await Connector.qIdToJson('Q0000000000000', 'Ulay')
    assert.isDefined(json)
    assert.isDefined(json.error);
    assert.isTrue(json.error.length > 10)
  })
  it('merge template', async () => {
    let text = await Connector.mergeTemplate(Q_ULAY, 'Ulay', 'name: {{artistName}}, real: {{bio.0.paragraphs.0.sentences.0.text}}',
      {imagePath: Path.join(__dirname, 'data')})
    assert.isDefined(text)
    assert.include(text, 'Ulay')
    assert.include(text, 'Frank Uwe')
  });

  it('merge filename', async() => {
    let text = await Connector.mergeFileName(Q_ULAY, 'Ulay', Path.join(__dirname, 'data', 'template.test.html'), {imagePath: Path.join(__dirname, 'data')})
    assert.isDefined(text)
    assert.include(text, 'Ulay')
    assert.include(text, 'Frank Uwe')
  })
});
