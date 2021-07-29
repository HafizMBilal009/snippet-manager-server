const User = require('../models/user');
const brcypt = require('bcryptjs');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
router.post('/', (req, res) => {
  const { email, passwordHash, passwordVerify } = req.body;
  if (!email || !passwordHash || !passwordVerify) {
    return res.status(400).json({
      errorMessage: 'Please enter all required fields.',
    });
  }
  if (passwordHash.length < 6) {
    return res.status(400).json({
      errorMessage: 'Password must be at least 6 characters long.',
    });
  }
  if (passwordHash !== passwordVerify) {
    return res.status(400).json({
      errorMessage: 'Please enter same password twice.',
    });
  }

  User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(400).json({
        errorMessage: 'An account with this email already exists.',
      });
    } else {
      brcypt.genSalt().then((salt) => {
        brcypt.hash(passwordHash, salt).then((hashedPassword) => {
          const newUser = new User({
            email,
            passwordHash: hashedPassword,
          });
          newUser.save().then(({ _id }) => {
            const token = jwt.sign({ id: _id }, process.env.JWT_SECRET);
            res
              .cookie('token', token, {
                httpOnly: true,
                sameSite:
                  process.env.NODE_ENV === 'development'
                    ? 'lax'
                    : process.env.NODE_ENV === 'production' && 'none',
                secure:
                  process.env.NODE_ENV === 'development'
                    ? false
                    : process.env.NODE_ENV === 'production' && true,
              })
              .send();
          });
        });
      });
    }
  });
});

router.post('/login', async (req, res) => {
  const { email, passwordHash } = req.body;
  if (!email || !passwordHash) {
    return res.status(400).json({
      errorMessage: 'Please enter all required fields.',
    });
  }

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(401).json({
      errorMessage: 'Wrong email or password.',
    });
  }
  const correctPassword = await brcypt.compare(
    passwordHash,
    existingUser.passwordHash
  );
  if (!correctPassword)
    return res.status(401).json({
      errorMessage: 'Wrong email or password.',
    });

  const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);
  res
    .cookie('token', token, {
      httpOnly: true,
      sameSite:
        process.env.NODE_ENV === 'development'
          ? 'lax'
          : process.env.NODE_ENV === 'production' && 'none',
      secure:
        process.env.NODE_ENV === 'development'
          ? false
          : process.env.NODE_ENV === 'production' && true,
    })
    .send();
});

router.get('/loggedIn', (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json(null);
    }
    const validatedUser = jwt.verify(token, process.env.JWT_SECRET);
    return res.json(validatedUser.id);
  } catch {
    return res.json(null);
  }
});

router.get('/logout', (req, res) => {
  try {
    res
      .cookie('token', '', {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === 'development'
            ? 'lax'
            : process.env.NODE_ENV === 'production' && 'none',
        secure:
          process.env.NODE_ENV === 'development'
            ? false
            : process.env.NODE_ENV === 'production' && true,

        expires: new Date(0),
      })
      .send();
  } catch {
    return res.json(null);
  }
});
module.exports = router;
