const Joi = require('joi');
const assert = require('assert');
const Joi2md = require('../src/joi2md');
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
    Jm.transferRows()
    const result = Jm.printMd();
    const destResult = "| 参数名 | 类型     | 必填   | 默认值 | 说明  |\n|-----|--------|------|-----|-----|\n| a   | number | true |     |     |\n";
    assert.equal(result, destResult)
  })
})