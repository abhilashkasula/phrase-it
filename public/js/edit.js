let editor;

const addListeners = (id) => {
  const editorElem = document.querySelector('#editor');
  const title = document.querySelector('#title');
  const publishButton = document.querySelector('#publish');
  editorElem.addEventListener('input', () => save(undefined, id));
  title.addEventListener('input', () => save(undefined, id));
  publishButton.classList.remove('disabled');
  publishButton.classList.add('enabled');
  publishButton.addEventListener('click', () => {
    publish(`story-${id}`, (error) => error && showErr(error));
  });
};

const renderContent = (editor, draft) => {
  document.querySelector('#title').value = draft.title;
  editor.render({blocks: draft.content});
  addListeners(draft.id);
};

const main = () => {
  editor = createEditor('editor');
  const [id] = document.URL.split('/').slice(-1);
  id &&
    fetch(`/draft/${id}`)
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
