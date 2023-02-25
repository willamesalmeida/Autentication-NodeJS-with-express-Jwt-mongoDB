const express = require('express');
const bcrypt = require('bcrypt');
const accountValidation = require('../validators/account');
const response = require('../middleware/response.js')

//Models

const User = require('../models/User.js');
const { getMessage } = require('../helpers/message');

//Define router
const router = express.Router()

//router to create user

router.post("/register", accountValidation, response,  async (req, res) => {
    const {nome, email, password} = req.body

    // Creating Hash

    const salt = 12
    const saltARounds = await bcrypt.genSaltSync(salt)
    const passwordHash = await bcrypt.hashSync(password, saltARounds)
   
    //check if user exists
   
    const userExists = await User.findOne({ email: email });
    if(userExists) return res.jsonBadRequest(null, "E-mail já cadastrado!")
    
    //create user
   
    const user = new User({
      nome,
      email,
      password: passwordHash,
    });
  
    try {
      await user.save();
      res.jsonOk(null, getMessage())
      /* res.status(200).json({msg: "Usuário criado com sucesso!"}) */
      console.log("oik")
    } catch (error) {
        res.jsonBadRequest(null, getMessage())
        /* res.status(500).json({msg: "Error no cadastro!"}) */
    }
    //res.status(200).json({msg: "tudo OK"})
    return res.jsonOk(null, getMessage("account.signin.success")) 
 });


 module.exports = router