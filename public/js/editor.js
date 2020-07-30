let editor;

const main = () => {
  editor = createEditor('editor', 'Write your story...');
  document.querySelector('#editor').addEventListener('input', save);
  document.querySelector('#title').addEventListener('input', save);
};

window.onload = main;
