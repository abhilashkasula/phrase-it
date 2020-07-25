const save = (editor, id) => {
  const title = document.querySelector('#title').value;
  editor.save().then((data) => {
    data.title = title;
    data.id = id;
    const options = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    fetch('updateStory', options);
  });
};

const addListeners = (editor, id) => {
  document
    .querySelector('#editor')
    .addEventListener('input', () => save(editor, id));
  document
    .querySelector('#title')
    .addEventListener('input', () => save(editor, id));
  document.querySelector('#publish').addEventListener('click', () => {
    if (document.querySelector('#title').value.trim()) {
      return publish(`story-${id}`);
    }
  });
};

const main = async () => {
  const res = await fetch('/createStory');
  const {id} = await res.json();

  const editor = new EditorJS({
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
  addListeners(editor, id);
};

window.onload = main;
