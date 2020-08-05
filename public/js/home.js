const sendGetRequest = (url, callback) => {
  const options = {
    method: 'GET',
  };
  fetch(url, options)
    .then((res) => res.json())
    .then((res) => callback(res));
};

const showStory = function (story_id) {
  location.replace(`/story/${story_id}`);
};

const createTitleElement = (title) => {
  const titleElement = document.createElement('h1');
  titleElement.className = 'title';
  titleElement.innerText = title;
  return titleElement;
};

const createStoryContentElement = (content) => {
  const contentElement = document.createElement('div');
  contentElement.className = 'story-content';
  contentElement.innerHTML = content;
  return contentElement;
};

const createTimeElement = (publishedAt) => {
  const timeElement = document.createElement('div');
  timeElement.className = 'story-time';
  timeElement.innerText = publishedAt;
  return timeElement;
};

const createAuthorNameElement = (authorName, authorId) => {
  const authorNameElement = document.createElement('a');
  authorNameElement.className = 'story-author-name';
  authorNameElement.href = `/profile/${authorId}`;
  authorNameElement.innerText = authorName;
  return authorNameElement;
};

const createStoryCover = (coverImageName) => {
  const container = document.createElement('div');
  const coverImage = document.createElement('img');
  container.className = 'coverImage-container';
  coverImage.src = `/coverImage/${coverImageName}`;
  coverImage.className = 'coverImage';
  container.appendChild(coverImage);
  return container;
};

const createStoryDetails = (author, authorId, publishedAt) => {
  const container = document.createElement('div');
  const publishedTime = moment(publishedAt).startOf('min').fromNow();
  container.appendChild(createAuthorNameElement(author, authorId));
  container.appendChild(createTimeElement(publishedTime));
  return container;
};

const createStoryContainer = (story) => {
  const container = document.createElement('div');
  const {title, content, author, authorId, published_at} = story;
  const contentToShow = content.length
    ? `${content[0].data.text.slice(0, 100)}...`
    : '';
  container.className = 'story-container';
  container.appendChild(createTitleElement(title));
  container.appendChild(createStoryContentElement(contentToShow));
  container.appendChild(createStoryDetails(author, authorId, published_at));
  return container;
};

const addStoryDetail = function (story, storyBox) {
  storyBox.appendChild(createStoryContainer(story));
  storyBox.appendChild(createStoryCover(story.coverImageName));
};

const getPublishedStories = () => {
  sendGetRequest('/dashboardStories', (stories) => {
    const dashBoard = document.querySelector('.dashboard');
    stories.forEach((story) => {
      const storyBox = document.createElement('div');
      storyBox.className = 'story-box';
      storyBox.setAttribute('onclick', `showStory(${story.id})`);
      addStoryDetail(story, storyBox);
      dashBoard.appendChild(storyBox);
    });
    const messageBox = document.querySelector('.message-box');
    messageBox.style.display = stories.length ? 'none' : 'block';
  });
};

window.onload = getPublishedStories;
