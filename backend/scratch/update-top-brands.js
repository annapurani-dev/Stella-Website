const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/site-config/homepage',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    let config = {};
    try {
      config = JSON.parse(data);
    } catch (e) {
      console.log('Error parsing config, using empty object');
    }

    config.topBrands = {
      title: 'Brands in Our Store',
      logos: [
        { name: 'Apple', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
        { name: 'Samsung', url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
        { name: 'Realme', url: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Realme_logo.png' }
      ]
    };

    const putData = JSON.stringify({ value: config });

    const putOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/site-config/homepage',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(putData),
      },
    };

    const putReq = http.request(putOptions, (putRes) => {
      let putResData = '';
      putRes.on('data', (c) => putResData += c);
      putRes.on('end', () => console.log('Successfully seeded topBrands! Response:', putResData));
    });

    putReq.write(putData);
    putReq.end();
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});
req.end();
