const {Joi2md, Joi} = require('../index');

const Jm = new Joi2md({
    a: Joi.object().keys({
    a1:Joi.string().email().default('hello world'),
    a2: Joi.number().integer().default(0),
    a3: Joi.array().items(Joi.string().valid('ee'), Joi.number(), Joi.date().timestamp()),
  }), b: Joi.date(),c: Joi.string().valid('a', 'b', 'c', 'd')});

const x = Jm.printMd();
console.log(x)