const addPublishListeners = (id) => {
  const popupButton = document.querySelector('#popup-publish');
  const publishButton = document.querySelector('#publish');
  popupButton.classList.remove('disabled');
  popupButton.classList.add('enabled');
  popupButton.href = '#tag-popup';
  publishButton.addEventListener('click', () => {
    const tagContainer = Array.from(document.querySelectorAll('.tag'));
    const tags = tagContainer.map(tag => tag.innerText.trim());
    publish(`story-${id}`, tags, (error) => error && showErr(error));
  });
};

const replaceListener = (id) => {
  const editorNode = document.querySelector('#editor');
  const title = document.querySelector('#title');
  editorNode.removeEventListener('input', save);
  title.removeEventListener('input', save);
  editorNode.addEventListener('input', () => save(undefined, id));
  title.addEventListener('input', () => save(undefined, id));
  addPublishListeners(id);
};

const showStatus = () => {
  const elem = document.querySelector('#status');
  elem.classList.remove('status-hide');
  elem.innerText = 'saving';
  setTimeout(() => {
    elem.innerText = 'saved';
  }, 1000);
};

const save = (__, storyId) => {
  const title = document.querySelector('#title').value;
  editor.save().then((data) => {
    data.title = title;
    data.id = storyId;
    const options = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    fetch('/updateStory', options)
      .then((res) => res.json())
      .then(({id, error}) => {
        showStatus();
        !storyId && replaceListener(id);
      });
  });
};
