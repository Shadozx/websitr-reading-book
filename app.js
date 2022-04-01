const express = require('express')
const catalog_router = require('./api/routers/catalogRouter')
const formatter = require('./api/helpers/formatter')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const Book = require('./api/models/book')
// const Page = require('./models/page')
const logger = require('morgan')
const api = require('./api/api')
// const urlencoded = express.urlencoded({ extended: false })
app.use(express.urlencoded({ extended: false }))
app.set('views', path.join(__dirname, 'api/views/website'))
app.use(express.static('api/public'))
app.set('view engine', 'ejs')

app.use(logger('dev'))

const mongourl =
  'mongodb+srv://Johny:3655954roma@cluster0.5wwwu.mongodb.net/website?retryWrites=true&w=majority'

mongoose.connect(mongourl, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})

app.use('/api', api)
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
app.get('/', function (req, res) {
  res.send('/')
})

app.use('/catalog', catalog_router)

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
app.get('/create', function (req, res) {
  res.sendFile(__dirname + '/api/views/create.html')
})

app.post('/create', async function (req, res) {
  const url = req.body.bookUrl
  if (!req.body) {
    console.log('F!')
    return res.sendStatus(400)
  }
  console.log(req.body)

  Book.findOne({ urlBook: url }).exec(function (err, book) {
    if (err) {
      console.log(err)
    }
    if (!book) {
      res.send(`Working...`)
      formatter.formatBookAndPages(url)
      console.log('good')
    }
    console.log('rgr')
    res.status(400).render('book_list')
    console.log('gijii')
  })
})

app.get('/example', function (req, res) {
  res.render('example')
})

app.listen(3000, function (err) {
  if (err) {
    console.log(err)
  }
  console.log('IT`S ALIVE!!!!')
})
