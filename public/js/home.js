const sendGetRequest = (url, callback) => {
  const options = {
    method: 'GET'
  };
  fetch(url, options)
    .then((res) => res.json())
    .then((res) => callback(res));
};

const getPublishedStories = () => {
  sendGetRequest('/publishedStories', (stories) => {
  });
};

window.onload = getPublishedStories;
