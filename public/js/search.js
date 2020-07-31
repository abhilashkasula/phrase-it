const createTitleElement = (title) => {
  const titleElement = document.createElement('h3');
  titleElement.className = 'title';
  titleElement.innerText =
    title.slice(0, 50) + (title.length > 50 ? '...' : '');
  return titleElement;
};

const createAuthorElement = (author) => {
  const authorElement = document.createElement('p');
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
  const card = document.createElement('div');
  card.className = 'card';
  card.appendChild(createTitleElement(story.title));
  card.appendChild(createAuthorElement(story.author));
  card.appendChild(createPublishedTimeElement(story.published_at));
  return card;
};

const createStoryCards = (containerId, stories) => {
  const container = document.querySelector(`#${containerId}`);
  stories.forEach((story) => container.appendChild(createStoryCard(story)));
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

const displayContainer = () => {
  document.querySelector('#search-placeholder').classList.add('hidden');
  document.querySelector('#search-result').classList.remove('hidden');
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
      createStoryCards('author-based-cards', authorBased);
      createStoryCards('tag-based-cards', tagBased);
      createStoryCards('content-based-cards', contentBased);
      displayContainer();
    });
};
