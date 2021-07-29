const router = require('express').Router();
const {
  getSnippets,
  addSnippet,
  deleteSnippet,
  updateSnippet,
} = require('../controllers/snippet');
const auth = require('../middleware/auth');
const Snippet = require('../models/snippet');

router.get('/', auth, getSnippets);
router.post('/', auth, addSnippet);
router.delete('/:id', auth, deleteSnippet);
router.put('/:id', auth, updateSnippet);

module.exports = router;
