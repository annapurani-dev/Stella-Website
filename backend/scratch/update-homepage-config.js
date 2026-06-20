const fs = require('fs');
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
    const config = JSON.parse(data);

    config.franchise.hubs = [
      { tag: 'Own Outlet', name: 'Unit I, Hongkong Plaza', address: '18A/65, Hongkong Plaza, Tuticorin - 628 002', phone: '+91 9345510510', manager: 'V.Raja', hours: '10 AM - 9 PM' },
      { tag: 'Own Outlet', name: 'Unit II, Hongkong Plaza', address: '18A/22, Hongkong Plaza, Tuticorin - 628 002', phone: '+91 9159592910', manager: 'M.Karthi', hours: '10 AM - 9 PM' },
      { tag: 'Own Outlet', name: 'Thalamuthu Nagar', address: '14/681, Thalamuthu Nagar Main Road, Thoothukudi - 628 002', phone: '+91 7639129460', manager: 'S. Solairaj', hours: '10 AM - 9 PM' },
      { tag: 'Own Outlet', name: 'Chidambara Nagar', address: 'East Coast Rd, Chidambara Nagar, Subbiah Puram, Thoothukudi, Tamil Nadu - 628 001', phone: '+91 9698510510', manager: 'K. Selvam', hours: '10 AM - 9 PM', link: 'https://maps.app.goo.gl/C99ETYfZa3x6ta7q6' },
      { tag: 'Own Outlet', name: 'Kulathur', address: 'Shop No. 01, Bus stand inside, Kulathur, Thoothukudi - 628 903', phone: '+91 8012510510', manager: 'K. Kaali', hours: '10 AM - 9 PM' },
      { tag: 'Franchise Outlet', name: 'Stella Hitech Mobiles, Pudukottai', address: 'JBR Complex, 3/416/32, Theri Rd, Pudukottai, Tamil Nadu – 628 103', phone: '+91 8870920709', manager: 'Easa', hours: '10 AM - 9 PM', link: 'https://maps.app.goo.gl/1QWHfXvSPbSxmQeUA' },
      { tag: 'Franchise Outlet', name: 'Stella Hitech Mobiles, Kulathur', address: 'V.M.S.T. Raj Complex, Behind Kulathur Bus stand, Kulathur, Tamil Nadu – 628 903', phone: '+91 8870920709', manager: 'K. Kaali', hours: '10 AM - 9 PM' },
      { tag: 'Franchise Outlet', name: 'MR.93 Hi Tech Mobiles', address: '149/8, Polepettai, 4th Gate, Ettayapuram Road, Muthammal Colony, Thoothukudi - 628 002', phone: '+91 7708855973', manager: 'P. Ramkumar', hours: '10 AM - 9 PM' },
    ];

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
      putRes.on('end', () => console.log('Update response:', putResData));
    });

    putReq.write(putData);
    putReq.end();
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});
req.end();
