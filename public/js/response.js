const respond = (storyId) => {
  const response = document.querySelector('#response').value;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({response, id: storyId}),
  };
  fetch('/addResponse', options).then(() => {
    document.querySelector('#response').value = '';
  });
};
