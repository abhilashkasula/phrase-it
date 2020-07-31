const addTags = () => {
  const text = event.target.value;
  const tags = document.querySelector('#tags');
  const tagContainer = document.createElement('div');
  const tag = `<div class="tag">${text.trim()}</div>
  <div class="delete-tag" onclick="removeTag()">&times</div>`;
  tagContainer.className = 'tag-container';
  tagContainer.innerHTML = tag;
  if (event.keyCode === 13 && text.trim() && tags.children.length < 5) {
    tags.appendChild(tagContainer);
    event.target.value = '';
  }
};

const removeTag = () => {
  document.querySelector('#tags').removeChild(event.target.parentElement);
};

const publish = (id, tags, cb) => {
  const storyId = id.split('-')[1];
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id: storyId, tags}),
  };
  fetch('/publish', options)
    .then((res) => res.json())
    .then(({status, error}) => {
      if (error) {
        return cb(error);
      }
      status && location.replace(`/story/${storyId}`);
    });
};
