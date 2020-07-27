let editor;

const replaceListener = (id) => {
  const editorNode = document.querySelector('#editor');
  const title = document.querySelector('#title');
  const publishButton = document.querySelector('#publish');
  editorNode.removeEventListener('input', save);
  title.removeEventListener('input', save);
  editorNode.addEventListener('input', () => save(undefined, id));
  title.addEventListener('input', () => save(undefined, id));
  publishButton.classList.remove('disabled');
  publishButton.classList.add('enabled');
  publishButton.addEventListener('click', () => {
    publish(`story-${id}`, (error) => error && showErr(error));
  });
};

const main = async () => {
  editor = createEditor('editor');
  document.querySelector('#editor').addEventListener('input', save);
  document.querySelector('#title').addEventListener('input', save);
};

window.onload = main;
