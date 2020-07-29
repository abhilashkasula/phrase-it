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

const main = () => {
  const responseTimes = Array.from(document.querySelectorAll('.response-time'));
  const published = document.querySelector('.published-time');
  const time = published.getAttribute('published_at');
  published.innerText = `Published ${moment(time).startOf('min').fromNow()}`;
  responseTimes.forEach(response => {
    const time = response.getAttribute('responded_at');
    response.innerText = `Responded ${moment(time).startOf('min').fromNow()}`;
  });
};

window.onload = main;
