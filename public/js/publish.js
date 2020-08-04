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

const publish = (storyId, formData, cb) => {
  const options = {
    method: 'POST',
    body: formData,
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
