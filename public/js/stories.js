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
  setTime('.draft-last-edited', 'Last edited');
  setTime('.publish-last-edited', 'Published');
};

window.onload = main;
