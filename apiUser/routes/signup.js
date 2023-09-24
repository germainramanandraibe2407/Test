const express = require('express');
const app = express();
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

// Route pour l'API de sign up
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expression régulière pour la validation de l'email

router.post('/', function(req, res) {
  const firstname= req.body.prenom,
        lastname= req.body.nom,
        email= req.body.email,
        password= req.body.mdp1;

  // Vérifier que tous les champs ont été fournis
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: `Veuillez fournir tous les champs nécessaires ${firstname}` });
  }

  // Vérifier la longueur des champs nom et prénom
  const minNameLength = 2;
  const maxNameLength = 50;
  if (firstname.length < minNameLength || firstname.length > maxNameLength || lastname.length < minNameLength || lastname.length > maxNameLength) {
    return res.status(400).json({ message: 'Le nom et le prénom doivent contenir entre 2 et 50 caractères' });
  }

  // Vérifier les caractères valides pour les champs nom et prénom
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\- ]+$/; // Permet les lettres (avec accents), les tirets et les espaces
  if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
    return res.status(400).json({ message: 'Le nom et le prénom doivent contenir uniquement des lettres, des tirets et des espaces' });
  }

  // Vérifier la complexité du mot de passe (exemple : au moins 8 caractères avec une lettre majuscule, une lettre minuscule, un chiffre et un seul des caractères spéciaux autorisés)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d,.!?]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères, incluant une lettre majuscule, une lettre minuscule, un chiffre et l\'un des caractères spéciaux autorisés : virgule, point d\'exclamation, point d\'interrogation ou point' });
  }


  // Vérifier si l'e-mail est au format valide
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "L'e-mail fourni n'est pas valide" });
  }

  // Vérifier si l'utilisateur existe déjà
  connection.query('SELECT * FROM utilisateurs WHERE email = ?', [email], function(err, results) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Crypter le mot de passe
    bcrypt.hash(password, 10, function(err, hash) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      // Ajouter l'utilisateur à la base de données
      connection.query('INSERT INTO utilisateurs (firstName, lastName, email, password) VALUES (?, ?, ?, ?)', [firstname, lastname, email, hash], function(err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Erreur serveur' });
        }
        
        return res.status(201).json({ message: 'Utilisateur créé avec succès' });
      });
    });
  });
});


module.exports = router;