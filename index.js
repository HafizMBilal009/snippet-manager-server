const express = require('express');
const mongoose = require('mongoose');
const snippetRoutes = require('./routes/snippet');
const userRoutes = require('./routes/user');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://snippetmanager-datumbrain.netlify.app',
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use('/snippet', snippetRoutes);
app.use('/auth', userRoutes);

mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@snippet-manager.cnbee.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error) => {
    if (error) return console.log({ error });
    console.log('Connected to MongoDB');
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Started server on port ${PORT}.`));
