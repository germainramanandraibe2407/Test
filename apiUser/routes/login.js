const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Configuration de la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'users'
});

// Middleware pour parser les requêtes en JSON
router.use(express.json());

// Middleware pour vérifier l'en-tête d'autorisation
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, 'my-secret-key', function(err, decoded) {
      if (err) {
        return res.status(401).send('Token invalide');
      } else {
        req.userId = decoded.userId;
        next();
      }
    });
  } else {
    res.status(401).send('Token non fourni');
  }
}

// Routes pour l'API de login
router.post('/', function(req, res) {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM utilisateurs WHERE email = ?';

  connection.query(sql, [email], function(err, results) {
    if (err) throw err;
    if (results.length === 0) {
      res.status(401).send('Email  incorrect');
      return;
    }

    const user = results[0];
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) throw err;

      if (result === false) {
        res.status(401).send(' Mot de passe incorrect');
        return;
      }

      const token = jwt.sign({ userId: user.userId }, 'my-secret-key');
      res.send({ token, userId: user.userId });

    });
  });
});

module.exports = router;
