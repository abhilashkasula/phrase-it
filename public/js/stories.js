const setTime = (stories, text) => {
  stories.forEach((story) => {
    const time = story.getAttribute('published_at');
    story.innerText = `${text} ${moment(time).startOf('min').fromNow()}`;
  });
};

const deleteDraft = () => {
  const draftId = document.querySelector('#delete').getAttribute('draftId');
  const callback = ({status}) => status && location.replace('/user/stories');
  sendPostReq('/user/deleteDraft', {draftId}, callback);
};

const assignDraftId = (draftId) => {
  const deleteButton = document.querySelector('#delete');
  deleteButton.setAttribute('draftId', draftId);
};

const main = () => {
  attachTabListeners();
  const drafts = Array.from(document.querySelectorAll('.draft-last-edited'));
  const publish = Array.from(document.querySelectorAll('.publish-last-edited'));
  setTime(drafts, 'Last edited');
  setTime(publish, 'Published');
};

window.onload = main;
