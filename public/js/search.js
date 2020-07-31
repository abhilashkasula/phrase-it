const search = () => {
  if (event.keyCode !== 13) {
    return;
  }
  const searchedKey = document.querySelector('#search-bar').value;
  fetch(`/search?keyword=${searchedKey}`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  }).then((res) => res.json());
};
