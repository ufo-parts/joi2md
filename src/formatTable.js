const utils = require('./utils');

function reformat(str) {
  const table = utils.splitStringToTable(str);

  table[1] = table[1].map(cell => utils.padHeaderSeparatorString(cell, 0));

  utils.fillInMissingColumns(table);

  const alignments = table[1].map(utils.getAlignment);
  const max_length_per_column = utils.getMaxLengthPerColumn(table);

  return `${table.map((row, row_index) => `|${row.map((cell, column_index) => {
    const column_length = max_length_per_column[column_index];
    if (row_index === 1) {
      return utils.padHeaderSeparatorString(cell, column_length + 2);
    }
    return ` ${utils.padStringWithAlignment(cell, column_length, alignments[column_index])} `;
  }).join('|')}|`).join('\n')}`;
}


module.exports = reformat;
