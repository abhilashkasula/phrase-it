let editor;

const addListeners = (id) => {
  const editorElem = document.querySelector('#editor');
  const title = document.querySelector('#title');
  editorElem.addEventListener('input', () => save(undefined, id));
  title.addEventListener('input', () => save(undefined, id));
  addPublishListeners(id);
};

const renderContent = (editor, draft) => {
  const title = document.querySelector('#title');
  title.value = draft.title;
  editor.render({blocks: draft.content});
  addListeners(draft.id);
  title.placeholder = 'Title';
};

const main = () => {
  document.querySelector('#title').placeholder = 'Loading...';
  editor = createEditor('editor', 'write your story here...');
  const [id] = document.URL.split('/').slice(-1);
  fetch(`/user/draft/${+id}`)
    .then((res) => res.json())
    .then(({draft, error}) => {
      if (error) {
        return;
      }
      draft.content = JSON.parse(draft.content);
      editor.isReady.then(() => renderContent(editor, draft));
    });
};

window.onload = main;
