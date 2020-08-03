const createTitleElement = (title) => {
  const titleElement = document.createElement('h3');
  titleElement.className = 'title';
  titleElement.innerText =
    title.slice(0, 50) + (title.length > 50 ? '...' : '');
  return titleElement;
};

const createAuthorElement = (author, authorId) => {
  const authorElement = document.createElement('a');
  authorElement.href = `/userProfile?userId=${authorId}`;
  authorElement.className = 'author';
  authorElement.innerText = author;
  return authorElement;
};

const createPublishedTimeElement = (publishedTime) => {
  const publishedTimeElement = document.createElement('p');
  publishedTimeElement.className = 'published-time';
  const formattedTime = `${moment(publishedTime).startOf('min').fromNow()}`;
  publishedTimeElement.innerText = formattedTime;
  return publishedTimeElement;
};

const createStoryCard = (story) => {
  const card = document.createElement('a');
  card.href = `/story/${story.id}`;
  card.className = 'card';
  card.appendChild(createTitleElement(story.title));
  card.appendChild(createAuthorElement(story.author, story.author_id));
  card.appendChild(createPublishedTimeElement(story.published_at));
  return card;
};

const createStoryCards = (type, stories) => {
  const container = document.querySelector(`#${type}-based-cards`);
  if (stories.length > 0) {
    container.classList.remove('hidden');
    document.querySelector(`#${type}-placeholder`).classList.add('hidden');
    stories.forEach((story) => container.appendChild(createStoryCard(story)));
  } else {
    container.classList.add('hidden');
    document.querySelector(`#${type}-placeholder`).classList.remove('hidden');
  }
};

const clearContainers = () => {
  const containerIds = [
    'author-based-cards',
    'tag-based-cards',
    'content-based-cards',
  ];
  containerIds.forEach((id) => {
    document.querySelector(`#${id}`).innerHTML = '';
  });
};

const showTab = (tab) => {
  const tabNames = Array.from(document.querySelectorAll('.tab-name'));
  const tabs = Array.from(document.querySelectorAll('.tab'));
  tabNames.forEach((tab, index) => {
    tab.classList.remove('selected-tab');
    tabs[index].classList.add('hidden');
  });
  const id = tab.id.split('-')[1];
  tab.classList.add('selected-tab');
  document.querySelector(`#${id}-search-result`).classList.remove('hidden');
};

const displayContainer = () => {
  document.querySelector('#search-placeholder').classList.add('hidden');
  document.querySelector('#search-result').classList.remove('hidden');
  const tabs = document.querySelectorAll('.tab-name');
  tabs.forEach((tab) => tab.addEventListener('click', () => showTab(tab)));
};

const addCounts = (counts) => {
  const {author, tag, content} = counts;
  document.querySelector('#author-based-count').innerText = `[ ${author} ]`;
  document.querySelector('#tag-based-count').innerText = `[ ${tag} ]`;
  document.querySelector('#content-based-count').innerText = `[ ${content} ]`;
};

const search = () => {
  if (event.keyCode !== 13) {
    return;
  }
  const searchBar = document.querySelector('#search-bar');
  const searchedKey = searchBar.value;
  if (searchedKey.trim() === '') {
    return;
  }
  fetch(`/search?keyword=${searchedKey}`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  })
    .then((res) => res.json())
    .then(({authorBased, tagBased, contentBased}) => {
      searchBar.value = '';
      clearContainers();
      createStoryCards('author', authorBased);
      createStoryCards('tag', tagBased);
      createStoryCards('content', contentBased);
      displayContainer();
      const counts = {
        author: authorBased.length,
        tag: tagBased.length,
        content: contentBased.length,
      };
      addCounts(counts);
    });
};
