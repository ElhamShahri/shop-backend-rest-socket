const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const MONGODB_URI =
  'mongodb+srv://userName:password@cluster0.i82qz.mongodb.net/messages?retryWrites=true&w=majority';


const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, 'images');
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {

    // cb(null, new Date().toISOString().replace(/\\/g, '/') + '-' + file.originalname);
    // cb(null, Date.now() + file.originalname);
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);

  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);


app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// mongoose
//   .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(result => {
//     const server = app.listen(8080);
//     // const io = require('socket.io')(server);

//     const io = require('./socket').init(server);

//     io.on('connection', (socket) => {
//       console.log('Client connected');
//     });

//   })
//   .catch(err => {
//     console.log(err);
//   });


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected!!");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });


const port = process.env.PORT || 8080;

const server = app.listen(port, () => console.log(`listening on port ${port}`));

const io = require('./socket').init(server);

io.on('connection', (socket) => {
  console.log('Client connected');
});








