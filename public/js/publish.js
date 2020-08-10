const createDeleteContainer = () => {
  const deleteTag = document.createElement('div');
  deleteTag.className = 'delete-tag';
  deleteTag.onclick = removeTag;
  deleteTag.innerHTML = '&times';
  return deleteTag;
};

const createTag = (text) => {
  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.innerText = text;
  return tag;
};

const createTagContainer = (text) => {
  const tagContainer = document.createElement('div');
  tagContainer.className = 'tag-container';
  tagContainer.appendChild(createTag(text));
  tagContainer.appendChild(createDeleteContainer());
  return tagContainer;
};

const addTags = () => {
  const text = event.target.value;
  const tags = document.querySelector('#tags');
  const tagContainer = createTagContainer(text.trim());
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
  fetch('/user/publish', options)
    .then((res) => res.json())
    .then(({status, error}) => {
      if (error) {
        return cb(error);
      }
      status && location.replace(`/story/${storyId}`);
    });
};
