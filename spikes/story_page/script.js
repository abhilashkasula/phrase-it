const addListeners = () => {
  document.querySelector('#story-url').addEventListener('click', () => {
    const url = document.querySelector('#url');
    url.style['visibility'] = 'visible';
    url.value = document.URL;
    url.select();
    url.setSelectionRange(0, 99999);
    document.execCommand('copy');
    url.style['visibility'] = 'hidden';
  });
};

const createPara = ({text}) => {
  const para = `<p class="content-para">${text}</p>`;
  return para;
}

const createHeader = ({text, level}) => {
  const header = `<h${level} class="content-header">${text}</h${level}>`;
  return header;
}

const createDelimiter = () => {
  const delimiter = `<div class="content-delimiter">. . .</div>`;
  return delimiter;
}

const blockTypes = {
  paragraph: createPara,
  header: createHeader,
  delimiter: createDelimiter,
};

const addContent = (blocks) => {
  const content = document.querySelector('#content');
  blocks.forEach((block) => {
    // content.appendChild();
    content.innerHTML += blockTypes[block.type](block.data);
  });
};

const main = () => {
  document.querySelector('#story-title').innerText = data.title;
  document.querySelector('#story-author-avathar').innerHTML =
    '<img src="https://avatars0.githubusercontent.com/u/58025056?v=4">';
  document.querySelector('#story-author-name').innerText = 'Abhilash';
  document.querySelector('#story-time').innerText = 'Jul 15';
  addListeners();
  addContent(data.blocks);
};

window.onload = main;
