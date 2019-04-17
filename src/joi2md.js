const Joi = require('joi');
const get = require('lodash.get');
const rmdt = require('reformat-markdown-table');

const helper = require('./helper');

class Joi2md {
  constructor(data) {
    this.Joi = Joi;
    this.setSchema(data || {});
    this.HEADERS = [
      'path',
      'type',
      'presence',
      'description',
      'default',
      'conforms',
      'unit',
      'allowed',
      'valids',
      'invalids',
      'dependencies',
      'renames',
      'examples',
      'notes',
      'tags',
    ];
    this.printHeaders = [
      ['path', '参数名'],
      ['type', '类型'],
      ['presence', '必填'],
      ['default', '默认值'],
      ['notes', '说明'],
    ];
    this.rows = [];
  }

  /**
   * 检查schema
   */
  setSchema(schema = this.schema) {
    if (schema.isJoi && schema._type === 'object') {
      this.schema = schema;
    } else if (!schema.isJoi && Object.prototype.toString.apply(schema) === '[object Object]') {
      this.schema = Joi.object().keys().append(schema);
    } else {
      throw new Error('joi2md: schema 类型错误!');
    }
    return this.schema;
  }

  /**
   * schema 追加
   * @param {*} schema
   */
  concatSchema(schema = {}) {
    if (schema.isJoi && schema._type === 'object') {
      this.schema = this.schema.concat(schema);
    } else if (!schema.isJoi && Object.prototype.toString.apply(schema) === '[object Object]') {
      this.schema = this.schema.append(schema);
    } else {
      throw new Error('joi2md: schema 类型错误!');
    }
    return this.schema;
  }

  /**
   * 设置schema 打印头
   * @param {*} headers
   */
  setPrintHeaders(headers = [
    ['path', '参数名'],
    ['type', '类型'],
    ['presence', '必填'],
    ['default', '默认值'],
    ['notes', '说明'],
  ]) {
    const { error } = Joi.validate(headers, Joi.array().items());
    if (error) throw new Error("joi2md: schema headers must [['a', 'b'],['c', 'd']]");
    this.printHeaders = headers;
  }

  /**
   * Joi schema 转换为rows
   * @param {*} rows
   * @param {*} schema
   * @param {*} key
   * @param {*} parent_settings
   */
  transferRows(schema = this.schema, key = undefined, parent_settings = { presence: 'optional' }) {
    const row = {
      path: key,
      type: schema._type,
      description: schema._description,
      unit: schema._unit,
      examples: helper.codeList(schema._examples),
      notes: helper.codeList(schema._notes),
      tags: helper.codeList(schema._tags),
    };

    const settings = helper.mergeObjects(parent_settings, schema._settings);

    this.rows.push(row);

    if ('default' in schema._flags) {
      // row.default = `\`${JSON.stringify(schema._flags.default)}\``;
      row.default = schema._flags.default;
    }

    row.presence = schema._flags.presence || settings.presence;

    row.conforms = schema._tests.slice();
    if (schema._flags.format) {
      row.conforms.push({
        name: 'format',
        arg: schema._flags.format === Joi.date().iso()._flags.format ? 'iso' : schema._flags.format,
      });
    }
    if (schema._flags.insensitive) {
      row.conforms.push({
        name: 'insensitive',
      });
    }
    row.conforms = row.conforms.map((test) => {
      let s = test.name;
      const v = test.arg;

      // update
      if (v !== undefined) {
        if (!(v === null || typeof v === 'undefined')) {
          s += ': ';
          s += v.toISOString ? v.toISOString() : v;
        }
      }

      // return `\`${s}\``;
      return s;
    }).join(', ');

    if (schema._valids._set.length) {
      row[
        schema._flags.allowOnly ? 'valids' : 'allowed'
      ] = helper.codeList(schema._valids._set, true);
    }

    if (schema._invalids._set.length) {
      row.invalids = helper.codeList(schema._invalids._set, true);
    }

    if (schema._inner.dependencies && schema._inner.dependencies.length) {
      row.dependencies = schema._inner.dependencies.map((dep) => {
        const peers = helper.codeList(dep.peers, false, ', ');
        switch (dep.type) {
          case 'and':
            return `If one is present, all are required: ${peers}.}`;
          case 'nand':
            return `If one is present, the others may not all be present: ${peers}.}`;
          case 'or':
            return `At least one must appear: ${peers}.}`;
          case 'xor':
            return `One and only one must appear: ${peers}.}`;
          case 'with':
            return `If \`${dep.key}\` is present, ${peers} must appear.}`;
          case 'without':
            return `If \`${dep.key}\` is present, ${peers} must not appear.}`;
          default:
            return '';
        }
      }).join(' ');
    }

    if (schema._inner.renames && schema._inner.renames.length) {
      row.renames = schema._inner.renames.map((rename) => {
        let s = `${rename.from} -> ${rename.to}`;
        let opt = [];
        if (rename.options.alias) {
          opt.push('alias');
        }
        if (rename.options.multiple) {
          opt.push('multiple');
        }
        if (rename.options.override) {
          opt.push('override');
        }
        opt = opt.join(',');
        if (opt) {
          s += ` (${opt})`;
        }
        return `\`${s}\``;
      }).join(' ');
    }

    if (schema._inner.matches) {
      schema._inner.matches.forEach((match) => {
        if (match.schema) {
          this.transferRows(match.schema, key, settings);
        }
      });
    }

    if (schema._inner.inclusions) {
      schema._inner.inclusions.forEach((sub_schema, i) => {
        const k = `${(key || '')} [+${i} ]`;
        this.transferRows(sub_schema, k, settings);
      });
    }
    if (schema._inner.exclusions) {
      schema._inner.exclusions.forEach((sub_schema, i) => {
        const k = `${(key || '')} [-${i} ]`;
        this.transferRows(sub_schema, k, settings);
      });
    }

    if (schema._inner.children) {
      schema._inner.children.forEach((child) => {
        const k = key ? `${key}.${child.key}` : child.key;
        this.transferRows(child.schema, k, settings);
      });
    }

    if (schema._type === 'object' && Array.isArray(schema._inner.patterns)) {
      schema._inner.patterns.forEach((pattern) => {
        const k = key ? `${key} ` : '';
        this.transferRows(pattern.rule, k + pattern.regex, settings);
      });
    }
  }

  /**
   * 打印md文件
   */
  printMd({ throws = false } = {}) {
    let md = '';
    try {
      this.transferRows();

      const data = this.rows.map((rec, dataI) => {
        if (dataI === 0 && rec.path === undefined && this.rows.length !== 1) {
          return null;
        }
        return this.printHeaders.map(([k], i) => {
          let v;
          switch (k) {
            case 'type':
              if (rec.type === 'array') {
                v = rec.type;
              } else {
                v = `${rec.type}${rec.conforms && rec.conforms.length > 0 ? `(${rec.conforms})` : ''}`;
              }
              break;
            case 'presence':
              v = rec.presence === 'required';
              break;
            default:
              v = rec[k];
              break;
          }
          if (v === null || v === undefined) {
            return i > 0 ? '' : '-';
          }
          if (v instanceof Date) {
            v = v.toISOString();
          }
          return String(v).replace(/\|/g, '');
        }).join('|');
      }).filter(v => v).join('\n');
      const titles = this.printHeaders.map(k => k[1]).join('|');
      const table = `${titles}\n\n${data}`;
      md = rmdt.reformat(table);
      return md;
    } catch (e) {
      if (throws) throw new Error(e);
      return md;
    }
  }

  /**
   * 生成json文件
   */
  printJson({ throws = false } = {}) {
    const result = {};
    try {
      this.transferRows();

      for (let i = 1; i < this.rows.length; i += 1) {
        const value = this.rows[i];
        let temp = result;
        const path = value.path.replace(/ \[\+(\d+) \]\w*/g, (v, index) => `[${index}]`);
        const lastPathArr = /(?:([\w\W]+)\[(\w+)\])$/.exec(path);
        const lastPathObj = /(?:([\w\W]+)\.(\w+))$/.exec(path);
        if (lastPathArr !== null) {
          temp = get(result, lastPathArr[1], []);
          temp[lastPathArr[2]] = temp[lastPathArr[2]] || helper.typeTransfer(value);
        } else if (lastPathObj !== null) {
          temp = get(result, lastPathObj[1], {});
          temp[lastPathObj[2]] = temp[lastPathObj[2]] || helper.typeTransfer(value);
        } else {
          temp[path] = temp[path] || helper.typeTransfer(value);
        }
      }
      console.log(JSON.stringify(result, null, '    '));
      return result;
    } catch (e) {
      if (throws) throw new Error(e);
      return result;
    }
  }
}

module.exports = Joi2md;
