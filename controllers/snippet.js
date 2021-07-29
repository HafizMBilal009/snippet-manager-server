const Snippet = require('../models/snippet');

const getSnippets = (req, res) => {
  Snippet.find({ user: req.user })
    .then((response) => {
      res.status(200).json(response);
    })
    .catch(() => res.status(500).send());
};
const addSnippet = (req, res) => {
  const { title, description, code } = req.body;
  if (!description && !code) {
    return res.status(400).json({
      errorMessage: 'You need to enter at least a description or some code.',
    });
  }
  const newSnippet = new Snippet({
    title,
    description,
    code,
    user: req.user,
  });
  newSnippet
    .save()
    .then((response) => res.status(200).json({ response }))
    .catch(() => {
      res.status(500).send();
    });
};
const deleteSnippet = (req, res) => {
  const snippetId = req.params.id;

  Snippet.findByIdAndDelete({ _id: snippetId })
    .then((response) => {
      if (!response) {
        return res
          .status(400)
          .json({ errorMessage: 'Snippet with given id not found.' });
      }

      return res.status(200).json({ message: 'Snippet deleted successfully.' });
    })
    .catch((error) => {
      return res.status(500).send();
    });
};
const updateSnippet = async (req, res) => {
  const snippetId = req.params.id;
  const { title, description, code } = req.body;

  if (!description && !code) {
    return res.status(400).json({
      errorMessage: 'You need to enter at least a description or some code.',
    });
  }
  const originalSnippet = await Snippet.findOne({ _id: snippetId });
  console.log({ originalSnippet });
  if (!originalSnippet) {
    return res
      .status(400)
      .json({ errorMessage: 'Snippet with given id not found.' });
  }
  if (originalSnippet.user.toString() !== req.user) {
    return res.status(401).send({ errorMessage: 'Unauthorized.' });
  }
  originalSnippet.title = title;
  originalSnippet.description = description;
  originalSnippet.code = code;

  originalSnippet
    .save()
    .then((response) => {
      if (!response) {
        return res
          .status(400)
          .json({ errorMessage: 'Snippet with given id not found.' });
      }

      return res.status(200).json({ message: 'Snippet updated successfully.' });
    })
    .catch((error) => {
      return res.status(500).send({ error });
    });
};

module.exports = {
  getSnippets,
  addSnippet,
  deleteSnippet,
  updateSnippet,
};
