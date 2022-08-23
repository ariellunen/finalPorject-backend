const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Child = require('../models/child');

const getChildren = async (req, res, next) => {
  let children;
  try {
    children = await Child.find({});
  } catch (err) {
    const error = new HttpError(
      'Fetching children failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ children: children.map(child => child.toObject({ getters: true })) });
};

const signupChild = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  // const { name, email, password } = req.body;
  const { name } = req.body;
  let existingUser
  try {
    existingUser = await Child.findOne({ name: name })
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'Kide exists already, please login instead.',
      422
    );
    return next(error);
  }

  const createdUser = new Child({
    name,
    drawing: [],
    image: req.file.path,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const getChildById = async (req, res, next) => {
  const kideId = req.params.uid;

  let child;
  try {
    child = await Child.findById(kideId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a user.',
      500
    );
    return next(error);
  }

  if (!child) {
    const error = new HttpError(
      'Could not find a draw for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ child: child.toObject({ getters: true }) });

}

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({});
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { name, email, password, userType } = req.body;

  let existingUser
  try {
    existingUser = await User.findOne({ name: name })
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again', 500
    );
    return next(error);
  }


  const createdUser = new User({
    name,
    email,
    password: hashPassword,
    userType
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again.',
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'supersecret',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again.',
      500
    );
    return next(error);
  }

  res.json({ userId: createdUser.id, email: createdUser.email, token: token, userType: createdUser.userType });
};

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a user.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      'Could not find a draw for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });

}

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email })
  console.log(existingUser)

  } catch (err) {
    const error = new HttpError(
      ' ההתחברות נכשלה, אנא נסה שנית',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'אימייל או סיסמה שגויים. אנא נסה שנית',
      401
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'אימייל או סיסמה שגויים. אנא נסה שנית',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'אימייל או סיסמה שגויים. אנא נסה שנית',
      401
    );
    return next(error);
  }


  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'ההתחברות נכשלה, אנא נסה שנית',
      500
    );
    return next(error);
  }

  res.json({ userId: existingUser.id, email: existingUser.email, userType: existingUser.userType, token: token });
};

exports.getChildren = getChildren;
exports.signupChild = signupChild;
exports.getChildById = getChildById;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
