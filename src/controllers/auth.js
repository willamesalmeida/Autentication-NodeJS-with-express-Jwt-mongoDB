const express = require('express');
const accountValidation = require('../validators/account');

const route = express.Router()

route.post("/auth/register", accountValidation, async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    
    //validaitons
    /* console.log(req.body);
    if (!name) {
      return res.status(422).json({ msg: "O nome é obrigatorio!" });
    }
  
    if (!email) {
      return res.status(422).json({ msg: "O email é obrigatorio!" });
    }
    if (!password) {
      return res.status(422).json({ msg: "A senha é obrigatorio!" });
    }
  
    if (password !== confirmPassword) {
      return res.status(422).json({ msg: "As senhas devem ser iguais!" });
    } */
  
    //check if user exists
   
    const userExists = await User.findOne({ email: email });
  
    if (userExists) {
      return res.status(422).json({ msg: "Por favor, utilize um outro e-mail!" });
    }
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hashSync(password, salt);
  
    //create user
   
    const user = new User({
      name,
      email,
      password: passwordHash,
    });
  
    try {
      await user.save();
      res.status(201).json({ msg: "Usuario criado com sucesso!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: "Aconteceu um erro no servideo, tente novamente mais tarde!",
      });
    }
  });






















route.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
  
    //validations
   
    if (!email) {
      return res.status(422).json({ msg: "O E-mail é obrigatorio!" });
    }
  
    if (!password) {
      return res.status(422).json({ msg: "A senha é obrigatoria!" });
    }
   
    // check if user exits
  
    const user = await User.findOne({ email: email });
  
    if (!user) {
      return res.status(422).json({ msg: "Usuario não encontrado!" });
    }
  
    // check if password match
  
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(422).json({ msg: "Senha inválida!" });
    }
  
    try {
      const secret = process.env.SECRET;
      const token = jwt.sign(
        {
          id: user._id,
        },
        secret
      );
  
      res.status(200).json({ msg: "Autenticação realizada com sucesso", token });
    } catch (error) {
      console.log(error);
  
      res.status(500).json({
        msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
      });
    }
  });