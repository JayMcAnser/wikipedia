/**
 * generate HTML from JSON
 *
 * version 0.1.0 Jay 2021-07-09
 */

const Handlebars = require('handlebars');
const Fs = require('fs');


class MergeEngine {
  constructor(template = undefined) {
    this._template = template !== undefined ? Handlebars.compile(template) : false;
    this.formatBegin = '<span class="accent">';
    this.formatEnd = '</span>'
    let vm = this;

    Handlebars.registerHelper('textlayout', function(block) {
      let text = Handlebars.Utils.escapeExpression(block.text);
      if (block.format) {
        if (Array.isArray(block.format)) {
          for (let blockIndex = 0; blockIndex < block.format.length; blockIndex++) {
            let t = Handlebars.Utils.escapeExpression(block.format[blockIndex])
            text = text.replace(block.format[blockIndex], `${vm.formatBegin}${t}${vm.formatEnd}`)
          }
        }
      }
      return new Handlebars.SafeString(text);
    })
  }

  set template(value) {
    this._template = value ? Handlebars.compile(value) : false
  }

  set format(values) {
    if (!Array.isArray(value)) {
      if (typeof values === 'object') {
        this.formatBegin = values.formatBegin;
        this.formatEnd = values.formatEnd;
      } else {
        this.formatBegin = values
      }
    } else {
      this.formatBegin = values[0];
      this.formatEnd = values[1]
    }
  }
  set templateFile(filename) {
    if (!Fs.existsSync(filename)) {
      throw new Error(`file does not exist. (${filename})`)
    }
    try {
      let buffer = Fs.readFileSync(filename, 'utf8');
      this.template = buffer
    } catch (e) {
      throw new Error(`[merge-engine.TemplateFile] ${e.message}`)
    }
  }

  merge(data) {
    if (this._template) {
      return this._template(data);
    } else {
      throw new Error('missing template')
    }
  }

  mergeToFile(data, fileName) {
    let html = this.merge(data);
    Fs.writeFileSync(fileName, html);
  }
}

module.exports = MergeEngine;
