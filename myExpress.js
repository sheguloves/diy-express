const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

class MyResponse {
  constructor(res) {
    this._res = res;
  }

  send(msg) {
    this._res.write(msg);
    this._res.end();
  }

  sendFile(path) {
    console.log(path);
    const rs = fs.createReadStream(path, {
      flags: 'r',
      encoding: 'utf-8',
      autoClose: true,
    });
    rs.on('end', () => {
      this._res.end();
    });
    rs.pipe(this._res);
  }
}

class MyServer {
  constructor() {
    this._server = http.createServer((req, res) => {
      console.log('request coming')
      const method = req.method;
      const { pathname, query } = url.parse(req.url);
      console.log(method, pathname, query);

      this._handleMiddleware(req, new MyResponse(res), this._requestHandler[pathname]?.[method]);
    });
  }

  _requestHandler = {};
  _middlewares = [];

  _handleMiddleware(req, res, final) {
    const len = this._middlewares.length;
    if (len > 0) {
      let i = 0;
      const middlewares = this._middlewares;
      let fn = middlewares[i];
      function next() {
        i = i + 1;
        if (i === len) {
          final && final(req, res);
        } else {
          fn = middlewares[i];
          fn(req, res, next);
        }
      }
      fn(req, res, next);
    }

  }

  use(middleware) {
    this._middlewares.push(middleware.bind(this));
  }

  route(path) {
    const router =  {
    };
    ['get', 'post'].forEach(method => {
      router[method] = (callback) => {
        this[method](path, callback);
        return router;
      };
    });

    return router;
  }

  listen(port, callback) {
    this._server.listen(port, (...args) => {
      callback && callback(...args);
    });
  }

  get(path, callback) {
    return this.request('GET', path, callback);
  }
  post(path, callback) {
    return this.request('POST', path, callback);
  }
  delete(path, callback) {
    return this.request('DELETE', path, callback);
  }
  patch(path, callback) {
    return this.request('PATCH', path, callback);
  }

  request(method, path, callback) {
    this._requestHandler[path] = this._requestHandler[path] || {};
    this._requestHandler[path][method] = callback;
    return this;
  }
}

function myExpress() {
  const app = new MyServer();
  return app;
}

myExpress.static = function (dir) {
  return (req, res, next) => {
    console.log('This is static router')
    const { pathname, query } = url.parse(req.url);
    const file = path.join(__dirname, dir, pathname);
    fs.readFileSync(file, 'utf-8', (error, data) => {
      if (error) {
        console.log(error)
        next();
      } else {
        console.log(data);
        console.log(data.toString());
        res.send(data.toString());
      }
    });
  }
}

module.exports = myExpress;