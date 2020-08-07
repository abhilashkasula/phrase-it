const logout = () => {
  fetch('/user/logout', {method: 'POST'}).then(({status}) => {
    status && document.location.replace('/');
  });
};
