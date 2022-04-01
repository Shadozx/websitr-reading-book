const Book = require('../models/book')
const Page = require('../models/page')
const Image = require('../models/image')
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.book_list = async function (req, res) {
  const images = await Image.find({}).populate('book').exec()
  res.render('catalog', { images })

  // Book.find({})
  //   .sort({ added: 1 })
  //   .populate('image')
  //   .exec(function (err, books) {
  //     if (err) {
  //       res.sendStatus(400)
  //       console.log(err)
  //     }
  //     console.log(books)
  //     res.render('catalog', { books })
  //   })
  //   const newbooks = []

  //   books.forEach(function (book_) {
  //     console.log(book_.image)
  //     Image.findOne({ book: book_.id }, function (err, img) {
  //       if (err) {
  //         console.log('pizda')
  //         console.log(err)
  //       }

  //       const book = {
  //         book_title: book_.title,
  //         book_url: book_.url,
  //         img_url: img.url,
  //       }
  //       newbooks.push(book)
  //     })
  //   })
  //   console.log(newbooks)
  //   res.render('catalog', { books: newbooks })
  // })
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.book_detail = async function (req, res) {
  const id = req.params.id
  const img = await Image.findOne({ book: id }).populate('book').exec()
  const pages = await Page.find({ book: id }).exec()

  res.render('book', { img, pages })
  // Book.findById({ _id: id }, function (err, book1) {
  //   if (err) {
  //     console.log(err.message)
  //   }
  //   // console.log(book1)
  //   let start = book1.url + '/1'
  //   // res.render('book_detail', { book, start })
  //   let pages_ = []

  //   Page.find({ book: book1._id })
  //     .sort({ pageNumber: 1 })
  //     .exec(function (err, pages) {
  //       if (err) {
  //         console.log(err)
  //       }

  //       pages.forEach(function (page) {
  //         pages_.push({ title: page.title, url: page.url })
  //       })
  //       Image.findOne({ book: book1._id }, function (err, findImg) {
  //         // console.log(pages_)
  //         res.render('book', {
  //           title: book1.title,
  //           book1,
  //           start,
  //           pages: pages_,
  //           findImg,
  //         })
  //       })
  // })
  // })
}
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.book_read = function (req, res) {
  const id = req.params.id
  const pageNumber = +req.params.page
  Book.findById({ _id: id }, function (err, book1) {
    if (err) {
      console.log(err)
    }
    console.log(pageNumber, book1.numberOfPages)
    if (pageNumber >= 1 && pageNumber <= book1.numberOfPages) {
      // console.log('Here!')
      Page.findOne({ book: book1._id, pageNumber }, function (err, page) {
        if (err) {
          console.log(err)
        }

        let currentPage = {
          title: page.title,
          textPage: page.textPage.split('\n'),
          previously: !(page.pageNumber - 1)
            ? null
            : book1.url + '/' + (page.pageNumber - 1),
          next:
            page.pageNumber + 1 > book1.numberOfPages
              ? null
              : book1.url + '/' + (page.pageNumber + 1),
          book: book1.url,
        }

        // console.log(currentPage)
        // res.render('book_page', { page: currentPage })
        res.render('page', { title: currentPage.title, page: currentPage })
      })
    } else {
      console.log(book1.url + '/1')
      res.redirect(book1.url + '/1')
    }
  })
}
