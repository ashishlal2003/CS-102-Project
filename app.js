let alert = require('alert')
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const { use } = require('passport')

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: 'student',
  },
})

const bookingSchema = new mongoose.Schema({
  room: {
    type: String,
    required: [true],
  },
  date: {
    type: Date,
    required: [true],
  },
  start: {
    type: String,
    required: [true],
  },
  end: {
    type: String,
    required: [true],
  },
  purpose: {
    type: String,
    required: [true],
  },
  status: {
    type: String,
    default: 'Pending',
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true],
  },
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model('User', userSchema)
const Booking = new mongoose.model('Booking', bookingSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 10 * 60 * 1000,
    },
  }),
)

app.use(passport.initialize())
app.use(passport.session())
mongoose.connect('mongodb://localhost:27017/userDB')

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.redirect('/admin_login')
  }
}

function isStudent(req, res, next) {
  if (req.user && req.user.role === 'student') {
    next()
  } else {
    res.redirect('/login')
  }
}

app.get('/', function (req, res) {
  res.render('signup', { warn: '' })
})

app.get('/home', function (req, res) {
  if (req.isAuthenticated()) {
    res.render('home')
  } else {
    res.redirect('login')
  }
})

app.get('/login', function (req, res) {
  res.render('login')
})

app.get('/admin_login', function (req, res) {
  res.render('admin_login')
})

app.get('/test', function (req, res) {
  if (req.user && req.user.role === 'admin') {
    res.render('test')
  } else {
    res.redirect('admin_login')
  }
})

app.get('/book', isStudent, function (req, res) {
  res.render('book')
})

app.get('/requests', isStudent, async function (req, res) {
  const requests = await Booking.find({ student: req.user._id }).populate(
    'student',
  )

  res.render('requests.ejs', {
    requests,
  })
})

app.get('/admin_approval', isAdmin, async function (req, res) {
  const requests = await Booking.find({ status: 'Pending' }).populate('student')

  res.render('admin_approval', {
    requests,
  })
})

app.get('/approve_request/:id', isAdmin, async (req, res, next) => {
  const id = req.params.id
  const booking = await Booking.findById(id)
  booking.status = 'Approved'
  await booking.save()
  res.redirect('/admin_approval')
})

app.get('/reject_request/:id', isAdmin, async (req, res, next) => {
  const id = req.params.id
  const booking = await Booking.findById(id)
  booking.status = 'Rejected'
  await booking.save()
  res.redirect('/admin_approval')
})

app.post('/', function (req, res) {
  User.register(
    { name: req.body.name, username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err)
        res.redirect('/')
      } else {
        if (req.body.username.split('@')[1] !== 'iiitdwd.ac.in') {
          res.render('signup', { warn: ' Please enter institute email Id' })
        } else {
          passport.authenticate('local')(req, res, function () {
            res.redirect('home')
          })
        }
      }
    },
  )
})

app.post('/login', function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  })

  req.login(user, function (err) {
    if (err) {
      console.log(err)
      res.redirect('login')
    } else {
      passport.authenticate('local')(req, res, function (something) {
        if (req.user.role === 'admin') {
          return req.logout(function (err) {
            if (err) {
              return next(err)
            }
            res.redirect('/')
          })
        } else {
          res.redirect('home')
        }
      })
    }
  })
})

app.post('/admin_login', function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  })

  req.login(user, function (err) {
    if (err) {
      console.log(err)
      res.redirect('login')
    } else {
      passport.authenticate('local')(req, res, function (something) {
        if (req.user.role === 'student') {
          req.logout(function (err) {
            if (err) {
              return next(err)
            }
            res.redirect('/')
          })
        } else {
          res.redirect('admin_approval')
        }
      })
    }
  })
})

app.post('/book', isStudent, function (req, res) {
  const booking = new Booking({
    student: req.user._id,
    date: req.body.date,
    room: req.body.Classrooms,
    start: req.body.start,
    end: req.body.end,
    purpose: req.body.purpose,
  })

  Booking.findOne(
    {
      date: req.body.date,
      room: req.body.Classrooms,
      start: { $lte: req.body.start },
      end: { $gte: req.body.end },
    },
    function (err, booking) {
      if (err) console.log(err)
      if (booking) {
        console.log('This solt is booked.')
        res.redirect('/book')
      } else {
        booking.save()
        res.redirect('/requests')
      }
    },
  )
})

app.post('/requests', isStudent, function (req, res) {})

app.listen(3000, function () {
  console.log('Server is running on port 3000.')
})
