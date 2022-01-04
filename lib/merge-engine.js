/**
 * generate HTML from JSON
 *
 * version 0.1.0 Jay 2021-07-09
 * version 0.2.0 Jay 2022-01-04
 */

const Handlebars = require('handlebars');
const Fs = require('fs');
const Path = require('path');


/**
 * options:
 *   bold: { openTag, closeTag}  replace the existing ones
 *   italic: { openTag, closeTag}  replace the existing ones
 *   {name}: { openTag, closeTag}  create a new obe
 */

class MergeEngine {
  constructor(template = undefined, options = {}) {
    this._template = template !== undefined ? Handlebars.compile(template) : false;
    this.blockReplace = {
      'bold': {
        openTag: '<span class="bold">',
        closeTag: '</span>'
      },
      'italic': {
        openTag: '<span class="italic">',
        closeTag: '</span>'
      }
    }
    for (const key in options) {
      if (this.blockReplace[key]) {
        if (options[key].openTag) {
          this.blockReplace[key].openTag = options[key].openTag
        }
        if (options.closeTag) {
          this.blockReplace[key].closeTag = options[key].closeTag
        }
      } else {
        this.blockReplace[key] = options[key]
      }
    }
    let vm = this;

    Handlebars.registerHelper('textlayout', function(block) {
      let text = Handlebars.Utils.escapeExpression(block.text);
      if (block.format) {
        // const keys = ['bold', 'italic'];
        const keys = {
          'bold': {
            openTag: '<span class="bold">',
            closeTag: '</span>'
          },
          'italic': {
            openTag: '<span class="italic">',
            closeTag: '</span>'
          }
        }

        for (const key in keys) {
          let tag = vm.blockReplace[key]
          if (block.format.hasOwnProperty(key)) {
            if (Array.isArray(block.format[key])) {
              for (let blockIndex = 0; blockIndex < block.format[key].length; blockIndex++) {
                let t = Handlebars.Utils.escapeExpression(block.format[key][blockIndex])
                text = text.replace(block.format[key][blockIndex], `${tag.openTag}${t}${tag.closeTag}`)
              }
            }
          }
        }
      }
      return new Handlebars.SafeString(text);
    })

    Handlebars.registerHelper('version', function() {
      let json = JSON.parse(Fs.readFileSync(Path.join(__dirname, '..', 'package.json'), 'utf8'))
      return json.version;
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
