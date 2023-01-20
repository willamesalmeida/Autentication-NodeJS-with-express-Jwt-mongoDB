require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

//Models
const User = require("./models/User");

//config JSON response
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Open Route - Public route
app.get("/", (req, res) => {
  const oi = "oi";
  console.log(req)
  return res.status(200).json({ msg: `${oi}` });
});

//Private Route

app.get("/user/:id", checkToken, async (req, res) => {
  
  const id = req.params.id

  //check if user exists

  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuario não encontrado!" });
  }

  return res.status(200).json({ user })
});

//Middleware check token

function checkToken(req, res, next){
  
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(" ")[1]
  console.log(req.headers)

  if(!token){
    return res.status(401).json({ msg: "Acesso negado!" })
  }

  try {

    const secret = process.env.SECRET
    jwt.verify(token, secret)
  
    next()
  } catch(error){
    res.status(400).json({msg: "Token inválido!"})

  }
}

//Register User

app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  //validaitons
  console.log(req.body);
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
  }

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

app.post("/auth/login", async (req, res) => {
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

//Credencials

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

//Conections with DB and run server

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.i45m479.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
    console.log("Server is runing");
  })
  .catch((err) => {
    console.log("Esse foi o erro encontrado na conexão" + err);
  });
