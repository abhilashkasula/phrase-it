const showCoverImage = () => {
  const image = document.querySelector('#coverImage');
  image.classList.replace('coverImage-before', 'coverImage-after');
  image.parentElement.style.display = 'block';
  image.src = URL.createObjectURL(event.target.files[0]);
};
