const respond = (storyId) => {
  const response = document.querySelector('#response').value;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({response, id: storyId}),
  };
  fetch('/addResponse', options).then((res) => {
    document.querySelector('#response').value = '';
    if (res.status === 200) {
      location.reload();
    }
  });
};
