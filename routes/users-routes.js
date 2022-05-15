const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');

const router = express.Router();

router.get('/children', usersController.getChildren);
router.get('/children/:uid', usersController.getChildById);

router.post(
  '/signupChild',
  [
    check('name')
      .not()
      .isEmpty(),
  ],
  usersController.signupChild
);


router.get('/', usersController.getUsers);
router.get('/:uid', usersController.getUserById);

router.post(
  '/signup',
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;
