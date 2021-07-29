const router = require('express').Router();
const {
  registerUser,
  login,
  getLoggedInUser,
  logout,
} = require('../controllers/user');
router.post('/', registerUser);
router.post('/login', login);
router.get('/loggedIn', getLoggedInUser);

router.get('/logout', logout);
module.exports = router;
