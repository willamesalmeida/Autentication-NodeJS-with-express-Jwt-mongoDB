const Joi = require("joi");

const rules = {
  nome: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] }, }),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  confirmPassword: Joi.ref("password"),
};

const accountValidation = (req, res, next) => {
    const {nome, email, password, confirme_Password } = req.body

    const schema = Joi.object({
        nome: rules.nome,
        email: rules.email,
        password: rules.password,
        confirme_Password: rules.confirmPassword,
    });

    const option = { abortEarly: false }
    const { error } = schema.validate({ nome, email, password, confirme_Password }, option)

    if( error ) {
        return res.status(403).json({msg:"Um dos valores estão faltando" })
    }
    console.log(error)
    next();
}

module.exports = accountValidation;
