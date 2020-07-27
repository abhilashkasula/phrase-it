const showErr = (err) => {
  const error = document.querySelector('#error');
  error.innerText = err;
  error.classList.remove('err-hide');
  setTimeout(() => error.classList.add('err-hide'), 3000);
};
