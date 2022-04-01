const Book = require('./models/book')
const Image = require('./models/image')
const express = require('express')
const router = express.Router()

router.get('/images/:filename', function (req, res) {
  const filename = req.params.filename
  Image.findOne({ filename: filename }, function (err, findImg) {
    if (err) {
      console.log(err)
    }
    res.status(200).write(findImg.data)
  })
})

module.exports = router
