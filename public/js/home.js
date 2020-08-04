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
  contentElement.innerText = `${content}....`;
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

const addStoryDetail = function (story, storyBox) {
  const {title, content, author, authorId, published_at} = story;
  const contentToShow = content.length ? content[0].data.text.slice(0, 70) : '';
  const publishedTime = moment(published_at).startOf('min').fromNow();
  storyBox.appendChild(createTitleElement(title));
  storyBox.appendChild(createStoryCover(story.coverImageName));
  storyBox.appendChild(createStoryContentElement(contentToShow));
  storyBox.appendChild(createAuthorNameElement(author, authorId));
  storyBox.appendChild(createTimeElement(publishedTime));
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
