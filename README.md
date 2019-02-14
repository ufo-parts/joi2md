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

// 设置简单json例子
```js
const Joi = require('joi');
const Joi2md = require('joi2md');

const Jm = new Joi2md();
    const schema = {
      a: Joi.object().keys({
      a1:Joi.string().default('hello world'),
      a2: Joi.number().default(0),
      a3: Joi.array().items(Joi.string().valid('ee'), Joi.number(), Joi.date().timestamp()),
    }), b: Joi.date(),};
    Jm.setSchema(schema);
    Jm.transferRows();
    const result = Jm.printJson();
```
>result
```json
{
    "a":{
        "a1":"hello world",
        "a2":0,
        "a3":[
            "",
            0,
            "date"
        ]
    },
    "b":"date"
}
```