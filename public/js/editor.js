let editor;

const main = async () => {
  editor = createEditor('editor');
  document.querySelector('#editor').addEventListener('input', save);
  document.querySelector('#title').addEventListener('input', save);
};

window.onload = main;
