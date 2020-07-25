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
    if (document.querySelector('#title').value.trim()) {
      return publish(`story-${id}`);
    }
    alert('Please add a title');
  });
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
        if (!storyId) {
          replaceListener(id);
        }
      });
  });
};

const addListeners = () => {
  document.querySelector('#editor').addEventListener('input', save);
  document.querySelector('#title').addEventListener('input', save);
};

let editor;

const main = async () => {
  editor = new EditorJS({
    holder: 'editor',
    tools: {
      header: {
        class: Header,
        config: {
          levels: [2, 3, 4],
          defaultLevel: 2,
        },
      },
      delimiter: Delimiter,
      inlineCode: InlineCode,
    },
  });
  addListeners();
};

window.onload = main;
