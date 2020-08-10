const logout = () => {
  const callback = ({status}) => status && location.replace('/');
  sendPostReq('/user/logout', {}, callback);
};
