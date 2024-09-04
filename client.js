const http = require('http');

http.get({
  method: 'GET',
  path: '/?a=1&b=2',
  port: 3000,
  host: 'localhost'
}, res => {
  const arr = [];
  res.on('data', (data) => {
    arr.push(data);
  });
  res.on('end', () => {
    let result = Buffer.concat(arr).toString();
    console.log(result);
  });
});