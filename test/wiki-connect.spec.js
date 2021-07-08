/**
 * Connector tester
 *
 *
 * examples: Ulay: Q69562
 */

const chai = require('chai');
const assert = chai.assert;
const Q_ULAY = 'Q69562'


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
  })
});
