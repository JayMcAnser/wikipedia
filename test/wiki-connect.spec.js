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

  // // blocked for testing
  // it('artist to info', async() => {
  //   let wikiConnect = new WikiConnect.Wiki();
  //   let result = await wikiConnect.artistByQId(Q_ULAY)
  //   assert.isDefined(result)
  //   assert.isDefined(result.wikiUrl);
  //   assert.equal(result.wikiUrl, 'https://en.wikipedia.org/wiki/Ulay')
  //   assert.equal(result.bio.length, 5);
  //   assert.equal(result.bio[1].title, 'Early career');
  //   assert.equal(result.bio[1].paragraphs.length, 1);
  //   // text may differ if changed in the wikipedia
  //   assert.equal(result.bio[1].paragraphs[0].sentences[0].text, 'In the early 1970s, struggling with his sense of "Germanness," Ulay moved to Amsterdam, where he began experimenting with the medium of Polaroid.')
  // })

  describe('listing years', () => {
    it('one year', () => {
      let scanner = new WikiConnect.Wiki();
      let years = scanner.listYears(['the 1945 range'])
      assert.isTrue(Array.isArray(years));
      assert.equal(years.length, 1);
      assert.equal(years[0], '1945')
    })
    it('multiple years', () => {
      let scanner = new WikiConnect.Wiki();
      let years = scanner.listYears(['the 1945 range 1946'])
      assert.isTrue(Array.isArray(years));
      assert.equal(years.length, 2);
      assert.equal(years[0], '1945')
      assert.equal(years[1], '1946')
    })
    it('multiple lines', () => {
      let scanner = new WikiConnect.Wiki();
      let years = scanner.listYears(['the 1945', 'range 1946'])
      assert.isTrue(Array.isArray(years));
      assert.equal(years.length, 2);
      assert.equal(years[0], '1945')
      assert.equal(years[1], '1946')
    });
    it('ordering', () => {
      let scanner = new WikiConnect.Wiki();
      let years = scanner.listYears(['the 1946', 'range 1945'])
      assert.isTrue(Array.isArray(years));
      assert.equal(years.length, 2);
      assert.equal(years[0], '1945')
      assert.equal(years[1], '1946')
    })

    it('single range', () => {
      let scanner = new WikiConnect.Wiki();
      let years = scanner.listYears(['the 1940-1945 range'])
      assert.isTrue(Array.isArray(years));
      assert.equal(years.length, 1);
      assert.equal(years[0], '1940 - 1945')
    })
    it('multi range', () => {
      let scanner = new WikiConnect.Wiki();
      let years = scanner.listYears(['the 1940-1945 range, 1982-1985'])
      assert.isTrue(Array.isArray(years));
      assert.equal(years.length, 2);
      assert.equal(years[0], '1940 - 1945')
    })
    it ('weird ranges', () => {
      let scanner = new WikiConnect.Wiki();
      let years = scanner.listYears(['the 1945-1940 range, 1982-1985'])
      assert.isTrue(Array.isArray(years));
      assert.equal(years.length, 2);
      assert.equal(years[0], '1940 - 1945')
    })

    it('range and years', () => {
      let scanner = new WikiConnect.Wiki();
      let years = scanner.listYears(['the 1940-1945 range, 1943'])
      assert.isTrue(Array.isArray(years));
      assert.equal(years.length, 1);
      assert.equal(years[0], '1940 - 1945')
    })
  })


  // it('artist - list', async() => {
  //   let wikiConnect = new WikiConnect.Wiki();
  //   let result = await wikiConnect.artistByQId(Q_ABRA)
  //   assert.isDefined(result)
  //   assert.isDefined(result.wikiUrl);
  //   assert.equal(result.wikiUrl, 'https://en.wikipedia.org/wiki/Ulay')
  // })
});
