## joi2md

## Install 
```shell
yarn add joi2md
```

## Use
```js
const Joi = require('joi');
const Joi2md = require('joi2md');

const Jm = new Joi2md();
// 设置schema
Jm.setSchema({
    name: Joi.number().default(1).required().notes('用户名'),
})
// schema 转换为行数据
Jm.transferRows()
//得到markdown字符串
Jm.setPrintHeaders([
    ['path', '参数名'],
    ['type', '类型'],
    ['presence', '必填'],
    ['default', '默认值'],
    ['notes', '说明'],
  ]);
const result = Jm.printMd()
console.log(result)
```
> result

| 参数名 | 类型     | 必填   | 默认值 | 说明  |
|-----|--------|------|-----|-----|
| name | number | true | `1` | `用户名` |