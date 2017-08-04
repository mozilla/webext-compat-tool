window.addEventListener('load', function (e) {
  let fileButton = document.querySelector('.upload__button--select');
  let fileInput = document.querySelector('#fileField');
  fileButton.addEventListener('click', function (e) {
    fileInput.click();
    e.preventDefault();
  });
  fileInput.addEventListener('change', function (e) {
    if (e.target.files.length) {
      console.log(e.target.files);
      document.querySelector('.upload').classList.add('is-ready');
      document.querySelector('.selected-file').innerHTML = 'selected file: ' + e.target.files[0].name
    }
  });
});
