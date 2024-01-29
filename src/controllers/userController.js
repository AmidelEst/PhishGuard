// src/controllers/userController.js

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const getUsers = (req, res) => {
  // Logic to fetch users
  res.json({ users: [] });
};

module.exports = {
  getUsers,
};

exports.register = async (req, res) => {
  try {
    let newUser = new User(req.body);
    await newUser.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.login = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send('Authentication failed. User not found.');
    }

    bcrypt.compare(req.body.password, user.password, function (err, isMatch) {
      if (isMatch && !err) {
        // Create token if the password matched and no error was thrown
        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
          expiresIn: '24h', // expires in 24 hours
        });
        res.json({ success: true, token: 'JWT ' + token });
      } else {
        res.status(401).send('Authentication failed. Wrong password.');
      }
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
  a;
};
