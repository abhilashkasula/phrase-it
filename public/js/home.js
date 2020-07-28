const sendGetRequest = (url, callback) => {
  const options = {
    method: 'GET',
  };
  fetch(url, options)
    .then((res) => res.json())
    .then((res) => callback(res));
};

const showStory = function(story_id) {
  location.replace(`/story/${story_id}`);
};

const addStoryDetail = function(story, storyBox) {
  const totalContent = JSON.parse(story.content);
  const contentLength = totalContent.length;
  const content = contentLength ? totalContent[0].data.text.slice(0, 70) : '';
  const storyDetail = `
  <h1 class="title">${story.title}</h1>
  <div class="story-content">${content} ...</div>
  <div class="story-author-container">
    <div>
      <div id="story-author-name">${story.author}</div>
      <div id="story-time">${story.published_at}</div>
    </div>
  </div>
  `;
  storyBox.innerHTML = storyDetail;
};

const getPublishedStories = () => {
  sendGetRequest('/publishedStories', (stories) => {
    const dashBoard = document.querySelector('.dashBoard');
    stories.reverse().forEach((story) => {
      const storyBox = document.createElement('div');
      storyBox.id = story.id;
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
