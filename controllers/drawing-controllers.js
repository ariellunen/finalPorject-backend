const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Draw = require('../models/draw');
const User = require('../models/user');

const getDrawById = async (req, res, next) => {
  const draweId = req.params.did;

  let draw;
  try {
    draw = await Draw.findById(draweId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a draw.',
      500
    );
    return next(error);
  }

  if (!draw) {
    const error = new HttpError(
      'Could not find a draw for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ draw: draw.toObject({ getters: true }) });
};

const getDrawingByUserId = async (req, res, next) => {
  const drawId = req.params.uid;

  let userWithDrawing;
  try {
    userWithDrawing = await User.findById(drawId).populate('drawing');
  } catch (err) {
    const error = new HttpError(
      'Fetching drawing failed, please try again later',
      500
    );
    return next(error);
  }

  if (!userWithDrawing || userWithDrawing.drawing.length === 0) {
    return next(
      new HttpError('Could not find drawing for the provided user id.', 404)
    );
  }

  res.json({
    drawing: userWithDrawing.drawing.map(draw =>
      draw.toObject({ getters: true })
    )
  });
};

const createDraw = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { firstKide, secondKide } = req.body;
  const createdDraw = new Draw({
    coordinate: [],
    timeStarted: '14:00',
    timeDone: '14:20',
    firstKide,
    secondKide,
    sync:'',
  });

  let first;
  let second;
  try {
    first = await User.findById(firstKide);
    second = await User.findById(secondKide);
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }

  if (!first) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }
  if (!second) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdDraw.save({ session: sess });
    first.drawing.push(createdDraw);
    await first.save({ session: sess });
    await createdDraw.save({ session: sess });
    second.drawing.push(createdDraw);
    await second.save({ session: sess });
    await sess.commitTransaction();

    // sess.startTransaction();
    // await createdDraw.save({ session: sess });
    // second.drawing.push(createdDraw);
    // await second.save({ session: sess });
    // await sess.commitTransaction();


  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Creating drawing failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ draw: createdDraw });
};

// const updatePlace = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return next(
//       new HttpError('Invalid inputs passed, please check your data.', 422)
//     );
//   }

//   const { title, description } = req.body;
//   const placeId = req.params.pid;

//   let place;
//   try {
//     place = await Place.findById(placeId);
//   } catch (err) {
//     const error = new HttpError(
//       'Something went wrong, could not update place.',
//       500
//     );
//     return next(error);
//   }

//   place.title = title;
//   place.description = description;

//   try {
//     await place.save();
//   } catch (err) {
//     const error = new HttpError(
//       'Something went wrong, could not update place.',
//       500
//     );
//     return next(error);
//   }

//   res.status(200).json({ place: place.toObject({ getters: true }) });
// };


const deleteDraw = async (req, res, next) => {
  const drawId = req.params.did;
  let drawFirst;
  let drawSecond;
  try {
    drawFirst = await Draw.findById(drawId).populate('firstKide');
    drawSecond = await Draw.findById(drawId).populate('secondKide');
  } catch (err) {
    
    const error = new HttpError(
      'Something went wrong, could not delete draw.',
      500
    );
    return next(error);
  }

  if (!drawFirst) {
    const error = new HttpError('Could not find draw for this id.', 404);
    return next(error);
  }
  if (!drawSecond) {
    const error = new HttpError('Could not find draw for this id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();    
    sess.startTransaction();
    await drawFirst.remove({ session: sess });
    drawFirst.firstKide.drawing.pull(drawFirst);
    console.log('drawFirst');

    await drawFirst.firstKide.drawing.save({ session: sess });
    console.log('2');
    await drawSecond.remove({ session: sess });
    drawSecond.firstKide.drawing.pull(drawSecond);
    await drawSecond.firstKide.save({ session: sess });
    await sess.commitTransaction();

  } catch (err) {
    // console.log(err);
    const error = new HttpError(
      'Something went wrong, could not delete draw.',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted draw.' });
};

exports.getDrawById = getDrawById;
exports.getDrawingByUserId = getDrawingByUserId;
exports.createDraw = createDraw;
// exports.updatePlace = updatePlace;
exports.deleteDraw = deleteDraw;
