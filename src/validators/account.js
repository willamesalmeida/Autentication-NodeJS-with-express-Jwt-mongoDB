const Joi = require("joi");
const { getMessage }= require('../helpers/message.js')


const getValidatorError = (error, messagePath) => {
  if (!error) return null;

  errosMessages = {};

  error.details.map((details) => {
    const message = details.message;
    const type = details.type;
    const key = details.context.key;

    const path = `${messagePath}.${key}.${type}`;
    console.log('esse é o path => ' + path)
    

    const customMessage = getMessage(path);

    if (!customMessage) {
      console.log("custom message not found for path", path);
    }
    errosMessages[key] = customMessage || message;

  });
  return errosMessages;
};

const rules = {
  nome: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  confirm_Password: Joi.string().valid(Joi.ref("password")).required(),
};

const accountValidation = (req, res, next) => {
  const { nome, email, password, confirm_Password } = req.body;

  const schema = Joi.object({
    nome: rules.nome,
    email: rules.email,
    password: rules.password,
    confirm_Password: rules.confirm_Password,
  });

  const option = { abortEarly: false };

  const { error } = schema.validate(
    { nome, email, password, confirm_Password },
    option
  );

  if (error) {
    
    const message = getValidatorError(error, "account.signin")
    

    return res.status(500).json({msg: message});
  }

  next();
};

module.exports = accountValidation;
