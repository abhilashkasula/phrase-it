const sendPostReq = (path, data, callback) => {
  fetch(path, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => callback(data));
};
