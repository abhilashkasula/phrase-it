const main = () => {
  const editor = new EditorJS({
    holder: 'editor',
    tools: {
      header: {
        class: Header,
        config: {
          levels: [2, 3, 4],
          defaultLevel: 3,
        },
      },
      delimiter: Delimiter,
      inlineCode: InlineCode,
    },
  });

  document.querySelector('#save').addEventListener('click', () => {
    editor.save().then((data) => {
      const title = document.querySelector('#title').value.trim();
      if (!title) {
        return;
      }
      data.title = title;
      console.log(JSON.stringify(data));
    });
  });
};

window.onload = main;
