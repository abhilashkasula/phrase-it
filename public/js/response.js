const respond = (storyId) => {
  const response = document.querySelector('#response').value;
  const callback = ({status}) => status && location.reload();
  sendPostReq('/user/addResponse', {response, id: storyId}, callback);
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
