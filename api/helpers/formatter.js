const axios = require('axios').default
const cheerio = require('cheerio')
const Book = require('../models/book')
const Page = require('../models/page')
const Image = require('../models/image')
const { getAmount, getInfo, getDescription, getImage } = require('./parser')
const async = require('async')
const iconv = require('iconv-lite')
/**
 *
 * @param {Array} pages
 * @param {Number} id
 */
async function savePages(pages, id) {
  async.each(pages, function (page, callback) {
    if (page) {
      const mPage = new Page({
        title: page.title,
        pageNumber: page.num,
        textPage: page.text.join('\n'),
        book: id,
      })

      mPage.save(function (err) {
        if (err) {
          console.log('Невдалося зберегти сторінку книжки!')
        }
        callback()
        console.log('Saved!')
      })
    }
  })
}

async function saveImage(url, id) {
  const imageData = await getImage(url)
  const img = new Image({
    contentType: 'image/png',
    data: imageData,
    book: id,
    filename: id + '.png',
    url: '/api/images/' + id + '.png',
  })
  img.save(function (err) {
    if (err) {
      console.log('Невдалося зберегти фотографію!!!!!!')
    }
    console.log('Вдалося все таки')
  })
}
/**
 *
 * @param {Number} amount
 * @param {String} url
 * @returns {Promise<Array>}
 */
async function getFormatedPages(amount, url) {
  let urls = []
  for (let i = 1; i <= amount; i++) {
    urls.push(getInfo(url + i))
  }
  // [{}, {}, {}]
  const data = await Promise.all(urls)
  data.forEach((val) => {
    console.log(val.size)
  })

  let pages = []

  console.log('========================================')

  data.forEach(function (val, i) {
    if (!i) {
      if (val.has('0')) {
        val.delete('0')
      }

      let currentPage = !pages.length ? 1 : pages.length
      for (let key of val.keys()) {
        pages.push({ title: key, text: val.get(key), num: currentPage })
        currentPage++
      }
      // pages.push({title: })
    } else {
      if (val.has('0')) {
        pages[pages.length - 1].text = pages[pages.length - 1].text.concat(
          val.get('0')
        )
        val.delete('0')
      }
      let currentPage = pages[pages.length - 1].num

      for (let key of val.keys()) {
        currentPage++
        pages.push({ title: key, text: val.get(key), num: currentPage })
      }
    }
  })
  // console.log(pages)
  return pages
}

/**
 *
 * @param {String} url
 * @returns {Promise<String>}
 */
async function getNameBook(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    })
    let buf = response.data
    let html, $

    if (response.request.host.startsWith('loveread')) {
      if (response.request.host == 'loveread.me') {
        html = buf.toString()

        $ = cheerio.load(html, { decodeEntities: false })
        const blAboutBook = $('div.blAboutBook').html()
        let data = []
        if (blAboutBook) {
          $('img').each(function (i, el) {
            data.push($(this).attr('title'))
          })
        }

        let nameBook = data[1].replace('Книга ', '')
        return nameBook
      } else if (response.request.host == 'loveread.ec') {
        html = iconv.decode(buf, 'windows-1251')
        $ = cheerio.load(html, { decodeEntities: false })
        html = $('td.span_str').html()
        return html.match(/<strong>.*?<\/strong>/g)[1].replace(/<[^>]+>/g, '')
      } else {
        return null
      }
    }
  } catch (e) {
    console.log(e)
  }
}

/**
 *
 * @param {String} url
 *
 */
async function formatBookAndPages(url) {
  const amount = await getAmount(url)
  const bookPage = url.split(/\/{1,2}|\?/g)
  console.log(amount)
  bookPage.splice(bookPage.indexOf('view_global.php'), 1, 'read_book.php')
  const http = bookPage[0]
  const host = bookPage[1]
  const b = bookPage[2]
  const id = bookPage[3] + '&p='
  const searchingPath = http + '//' + host + '/' + b + '?' + id

  let title = await getNameBook(url)
  let description = await getDescription(url)
  const pages = await getFormatedPages(amount, searchingPath)

  if (title) {
    const book = new Book({
      title,
      numberOfPages: pages.length,
      urlBook: url,
      description,
    })
    book.save(function (err) {
      if (err) {
        console.log(err)
      }
      saveImage(url, book._id)
      savePages(pages, book._id)
    })
  } else {
    title = await getNameBook(url)
    if (title) {
      const book = new Book({
        title,
        numberOfPages: pages.length,
        urlBook: url,
      })
      book.save(function (err) {
        if (err) {
          console.log(err)
        }
        savePages(pages, book._id)
      })
    }
  }
}

module.exports.formatBookAndPages = formatBookAndPages
