// const express = require('express')
const path = require('path');
const express = require('./myExpress');
const app = express()
const port = 3000


const myLogger = function (req, res, next) {
  console.log('LOGGED')
  setTimeout(() => {
    console.log('LOGGED setTimeout')
    next()
  }, 200)
}

const myLogger2 = function (req, res, next) {
  console.log('LOGGED2')
  setTimeout(() => {
    console.log('LOGGED2 setTimeout')
    next()
  }, 200)
}

app.use(myLogger)
app.use(myLogger2)

app.route('/').get((req, res) => {
  console.log('route Get method coming');
  res.sendFile(path.resolve(__dirname, './index.html'));
  // res.send('request is recieved');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
