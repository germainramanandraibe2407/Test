const express = require('express');
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cors = require('cors');
app.use(cors());

// Configuration de la base de données MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'users'
  });

// Middleware pour parser les requêtes en JSON
app.use(express.json());

// Routes pour l'API de signup
const signUpRoutes = require('./routes/signup');
app.use('/api/signup', signUpRoutes);

// Routes pour l'API de login
const loginRoutes = require('./routes/login');
app.use('/api/login', loginRoutes);

// Démarrage du serveur
app.listen(3000, function() {
    console.log('Serveur démarré sur le port 3000');
  });
  
 