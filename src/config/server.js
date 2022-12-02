const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const accounts = require("../model/accounts");
const allowCors = require("../config/cors");
const bcrypt = require("bcrypt");
const token = require("jsonwebtoken");
const server = express();
require("dotenv/config");

server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
server.use(cors());
server.use(allowCors);

// CRUD

// GET - para consultar
server.get("/", (req, res) => {
  accounts
    .query()
    .select("*")
    .then((data) => {
      res.status(200).json(data);
    });
});

// GET ID = para consultar por ID
server.get("/consulta/:id", async (req, res) => {
  const id = req.params.id;

  const user = await accounts.query().findById(id);

  if (!user)
    return res.status(404).json({ message: "Usuário não encontrado!" });

  return res.status(200).json(user);
});

// POST - para criar
server.post("/create", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "Dados inválidos!" });

  const verifyEmail = await accounts.query().findOne({ email });

  if (verifyEmail)
    return res.status(400).json({ message: "Email já cadastrado!" });

  const hash = await bcrypt.hash(password, 10);

  console.log(hash);

  const user = await accounts
    .query()
    .insert({
      username,
      email,
      password: hash,
    })
    .returning("*");

  res.status(201).json(user);
});

// PUT - para atualizar
server.put("/atualizar/:id", async (req, res) => {
  const id = req.params.id;

  const { nome, email, senha } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "Dados inválidos!" });

  const user = await accounts
    .query()
    .findById(id)
    .update({
      username: nome,
      email,
      password: senha,
    })
    .returning("*");

  return res.status(200).json(user);
});

// DELETE - para deletar
server.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  const user = accounts
    .query()
    .deleteById(id)
    .returning("*")
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
});

server.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Dados inválidos!" });

  // consultar o email
  const user = await accounts.query().findOne({
    email,
  });

  const generateToken = token.sign(
    {
      id: user.id,
    },
    process.env.SECRET,
    {
      expiresIn: "30s",
    }
  );

  if (!user)
    return res.status(400).json({ message: "Usuário não encontrado!" });

  // comparar a senha
  const compare = await bcrypt.compare(password, user.password);

  if (!compare) return res.status(400).json({ message: "Senha inválida!" });

  return res.status(200).json({
    message: "Login realizado com sucesso!",
    user: {
      ...user,
      token: generateToken,
    },
  });
});

server.get("/private/get", async (req, res) => {
  try {
    const tokenHeader = req.headers.authorization;

    if (!tokenHeader)
      return res.status(401).json({ message: "Token não encontrado!" });

    const verifyToken = token.verify(tokenHeader, process.env.SECRET);

    const user = await accounts.query().select("*");

    res.status(200).json({ message: "Acesso permitido!", user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

server.listen(3333, () => {
  console.log("Server is running on port 3333");
});
