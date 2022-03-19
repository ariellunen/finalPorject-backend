const express = require('express');
const { check } = require('express-validator');

const drawingControllers = require('../controllers/drawing-controllers');

const router = express.Router();

router.get('/:did', drawingControllers.getDrawById);
router.get('/', drawingControllers.getAllDraw);

router.get('/user/:uid', drawingControllers.getDrawingByUserId);

router.post(
  '/',
  [
    // check('coordinate')
    //   .not()
    //   .isEmpty(),
    // check('description').isLength({ min: 5 }),
    check('firstKide')
      .not()
      .isEmpty(),
    check('secondKide')
      .not()
      .isEmpty(),
  ],
  drawingControllers.createDraw
);

// router.patch(
//   '/:pid',
//   [
//     check('title')
//       .not()
//       .isEmpty(),
//     check('description').isLength({ min: 5 })
//   ],
//   placesControllers.updatePlace
// );

router.delete('/:did', drawingControllers.deleteDraw);

module.exports = router;
