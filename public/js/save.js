const preparePayload = (id) => {
  const tagContainer = Array.from(document.querySelectorAll('.tag'));
  const tags = tagContainer.map((tag) => tag.innerText.trim());
  const form = new FormData();
  const file = document.querySelector('#coverImage-fetcher').files[0];
  form.append('coverImage', file);
  form.append('tags', tags);
  form.append('id', id);
  publish(id, form, (error) => {
    if (error) {
      document.querySelector('#popup-close').click();
      showErr(error);
    }
  });
};

const addPublishListeners = (id) => {
  const popupButton = document.querySelector('#popup-publish');
  const publishButton = document.querySelector('#publish');
  popupButton.classList.remove('disabled');
  popupButton.classList.add('enabled');
  popupButton.href = '#tag-popup';
  publishButton.addEventListener('click', () => preparePayload(id));
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

const showErr = (err) => {
  const error = document.querySelector('#error');
  error.innerText = err;
  error.classList.remove('status-hide');
  setTimeout(() => error.classList.add('status-hide'), 3000);
};

const save = (__, storyId) => {
  const title = document.querySelector('#title').value;
  editor.save().then((data) => {
    data.title = title;
    data.id = storyId;
    sendPostReq('/user/updateStory', data, ({id}) => {
      showStatus();
      !storyId && replaceListener(id);
    });
  });
};
