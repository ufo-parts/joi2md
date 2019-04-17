const codeList = (inarr, to_json, insep) => {
  let arr = inarr;
  let sep = insep;
  if (!arr || !arr.length) {
    return undefined;
  }
  if (to_json) {
    arr = arr.map(v => JSON.stringify(v));
  }
  sep = sep || ' ';
  return `\`${arr.join(`\`${sep}\``)}\``;
};

const mergeObjects = (...args) => {
  const result = {};
  let arg_i = 0;
  const args_l = args.length;
  let arg;
  let keys;
  let key_i;
  let key;

  for (; arg_i < args_l; arg_i += 1) {
    arg = args[arg_i];
    if (arg) {
      keys = Object.keys(arg);
      for (key_i = keys.length - 1; key_i >= 0; key_i -= 1) {
        key = keys[key_i];
        result[key] = arg[key];
      }
    }
  }
  return result;
};
const typeTransfer = (obj) => {
  let res = obj.type;
  if (obj.default) return obj.default;
  switch (obj.type) {
    case 'array':
      res = [];
      break;
    case 'object':
      res = {};
      break;
    case 'number':
      res = 0;
      break;
    case 'string':
      res = '';
      break;
    default:
      break;
  }
  return res;
};

module.exports = {
  codeList,
  mergeObjects,
  typeTransfer,
};
