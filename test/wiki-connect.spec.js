/**
 * Connector tester
 *
 *
 * examples: Ulay: Q69562
 */

const chai = require('chai');
const assert = chai.assert;
const Q_ULAY = 'Q69562'
const Q_ABRA = 'Q47496'


const WikiConnect = require('../lib/wiki-connect')

describe('wiki-connect', function () {

  it('create', () => {
    let wikiConnect = new WikiConnect.Wiki();
    assert.isDefined(wikiConnect)
  })

  it('artist to info', async() => {
    let wikiConnect = new WikiConnect.Wiki();
    let result = await wikiConnect.artistByQId(Q_ULAY)
    assert.isDefined(result)
    assert.isDefined(result.wikiUrl);
    assert.equal(result.wikiUrl, 'https://en.wikipedia.org/wiki/Ulay')
    assert.equal(result.bio.length, 5);
    assert.equal(result.bio[1].title, 'Early career');
    assert.equal(result.bio[1].paragraphs.length, 1);
    // text may differ if changed in the wikipedia
    assert.equal(result.bio[1].paragraphs[0][0].text, 'In the early 1970s, struggling with his sense of "Germanness," Ulay moved to Amsterdam, where he began experimenting with the medium of Polaroid.')
  })

  // it('artist - list', async() => {
  //   let wikiConnect = new WikiConnect.Wiki();
  //   let result = await wikiConnect.artistByQId(Q_ABRA)
  //   assert.isDefined(result)
  //   assert.isDefined(result.wikiUrl);
  //   assert.equal(result.wikiUrl, 'https://en.wikipedia.org/wiki/Ulay')
  // })
});
