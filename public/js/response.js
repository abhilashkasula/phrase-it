const respond = (storyId) => {
  const response = document.querySelector('#response').value;
  const callback = ({status}) => status && location.reload();
  sendPostReq('/user/addResponse', {response, id: storyId}, callback);
};

const main = () => {
  setTime('.published-time', 'Published');
  setTime('.response-time', 'Responded');
};

window.onload = main;
