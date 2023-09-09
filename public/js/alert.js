/*eslint-disable*/

// type is 'success' or 'error'
export const showAlert = (type, msg) => {
  const markup = `<div class="alert alert--${type}">${type}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
};
