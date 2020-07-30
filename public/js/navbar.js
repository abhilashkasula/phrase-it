const logout = () => {
  fetch('/logout', {method: 'POST'}).then(({status}) => {
    status && document.location.replace('/');
  });
};
