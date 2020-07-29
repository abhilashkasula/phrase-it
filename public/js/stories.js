const showTab = (tab) => {
  const tabNames = Array.from(document.querySelectorAll('.tab-name'));
  const tabs = Array.from(document.querySelectorAll('.tab'));
  tabNames.forEach((tab, index) => {
    tab.classList.remove('selected-tab');
    tabs[index].classList.add('hidden');
  });
  const id = tab.id.split('-')[1];
  tab.classList.add('selected-tab');
  document.querySelector(`#${id}`).classList.remove('hidden');
};

const setTime = (stories, text) => {
  stories.forEach(story => {
    const time = story.getAttribute('published_at');
    story.innerText = `${text} ${moment(time).startOf('min').fromNow()}`;
  });
};

const main = () => {
  const tabs = Array.from(document.querySelectorAll('.tab-name'));
  const drafts = Array.from(document.querySelectorAll('.draft-last-edited'));
  const publish = Array.from(document.querySelectorAll('.publish-last-edited'));
  setTime(drafts, 'Last edited');
  setTime(publish, 'Published');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => showTab(tab));
  });
};

window.onload = main;
