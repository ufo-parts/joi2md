## joi2md

## Install 
```shell
yarn add joi2md
```

## Use
```js
const { Joi2md, Joi } = require('joi2md');

const Jm = new Joi2md({
  name: Joi.number().default(1).required().notes('用户名'),
});

// 设置schema
Jm.setSchema({
  name: Joi.number().default(1).required().notes('用户名'),
});
// 得到markdown字符串
const result = Jm.printMd();
console.log(result);

```
> result

| 参数名 | 类型     | 必填   | 默认值 | 说明  |
|-----|--------|------|-----|-----|
| name | number | true | `1` | `用户名` |

// 设置简单json例子
```js
const { Joi2md, Joi } = require('joi2md');

const Jm = new Joi2md();

const schema = {
  a: Joi.object().keys({
    a1: Joi.string().default('hello world'),
    a2: Joi.number().default(0),
    a3: Joi.array().items(Joi.string().valid('ee'), Joi.number(), Joi.date().timestamp()),
  }),
  b: Joi.date(),
};
Jm.setSchema(schema);
const result = Jm.printJson();
console.log(result);
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
## Usage
### new Joi2md( schema )
> 初始化Joi2md对象
### setSchema( schema );
> 重新设置Joi2md对象的 Joi Schema
```js
Jm.setSchema({
    name: Joi.string().notes('姓名'),
});
```
### concatSchema( schame )
> 追加Schema，进行append或者concat动作
```js
Jm.concatSchama({
    age: Joi.number().integer().notes('年龄'),
})
```
### setPrintHeaders( [] );
> 设置md头的中文翻译，默认为：
```js
[
    ['path', '参数名'],
    ['type', '类型'],
    ['presence', '必填'],
    ['default', '默认值'],
    ['notes', '说明']
];
```
### printMd( { throws=false } )
> 输出md文件
 ```js
const result = Jm.printMd();
console.log(result);
 ```

### printJson( { throws=false } )
> 输出JSON文件
```js
const result = Jm.printJson();
console.log(result);
```