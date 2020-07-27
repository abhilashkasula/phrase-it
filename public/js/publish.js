const publish = (id, cb) => {
  const storyId = id.split('-')[1];
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id: storyId}),
  };
  fetch('/publish', options)
    .then((res) => res.json())
    .then(({status, error}) => {
      if(error) {
        return cb(error);
      }
      status && location.replace(`/story/${storyId}`);
    });
};
