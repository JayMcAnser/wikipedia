/**
 * test the merge engine
 */


const chai = require('chai');
const assert = chai.assert;
const Path = require('path');
const Fs = require('fs')
const Q_ULAY = 'Q69562'
const Q_ABRA = 'Q47496'


const WikiConnect = require('../lib/wiki-connect')
const MergeEngine = require('../lib/merge-engine');

describe('merge-engine', function () {
  it('create', () => {
    let me = new MergeEngine();
    assert.isDefined(me)
  });

  it('bold replace', () => {
    let me = new MergeEngine();
    me.templateFile = Path.join(__dirname, 'data/template.replace.html')
    let data = JSON.parse(Fs.readFileSync(Path.join(__dirname, 'data/replace.data.json'), 'utf8'));
    let result = me.merge(data);
    assert.include(result, '<span class="bold">Nan Hoover</span>', 'should replace it')
  })

  it('custom replace', () => {
    let me = new MergeEngine(undefined, {bold: { openTag: '<span class="mk-font-bold">'}});
    me.templateFile = Path.join(__dirname, 'data/template.replace.html')
    let data = JSON.parse(Fs.readFileSync(Path.join(__dirname, 'data/replace.data.json'), 'utf8'));
    let result = me.merge(data);
    assert.include(result, '<span class="mk-font-bold">Nan Hoover</span>', 'should replace it')
  })

});
