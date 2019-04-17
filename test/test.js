const Joi = require('joi');
const assert = require('assert');
const {Joi2md, } = require('../index');
const Jm = new Joi2md();
describe('setSchema test',()=>{
    it('joi not object should throw error', ()=>{
      assert.throws(()=>{
        Jm.setSchema(Joi.number());
      })
    })
    it('joi object should ok', ()=>{
      assert.ok(Jm.setSchema(Joi.object().keys({
        a: Joi.string()
      })))
    })
    it('object should ok', ()=>{
      assert.ok(()=>{
        Jm.setSchema({a: Joi.string()});
      })
    })
    it('object should throw error', ()=>{
      assert.throws(()=>{
        Jm.setSchema('error');
      })
    })
});
describe('printMd test', ()=>{
  it('return ok', ()=>{
    const schema = {
      a:Joi.number().required()
    }
    Jm.setSchema(schema)
    const result = Jm.printMd();
    const destResult = "| 参数名 | 类型     | 必填   | 默认值 | 说明  |\n|-----|--------|------|-----|-----|\n| a   | number | true |     |     |\n";
    assert.equal(result, destResult)
  })
})
describe('printJson test', ()=>{
  it('return ok', ()=>{
    const Jm = new Joi2md();
    const schema = {
      a: Joi.object().keys({
      a1:Joi.string().default('hello world'),
      a2: Joi.number().default(0),
      a3: Joi.array().items(Joi.string().valid('ee'), Joi.number(), Joi.date().timestamp()),
    }), b: Joi.date(),};
    Jm.setSchema(schema);
    const result = Jm.printJson();
    const destResult = `{"a":{"a1":"hello world","a2":0,"a3":["",0,"date"]},"b":"date"}`;
    assert.equal(JSON.stringify(result), destResult);
  })
})