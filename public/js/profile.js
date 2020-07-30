const showTab = (tab) => {
  const tabNames = Array.from(document.querySelectorAll('.tab-name'));
  const tabs = Array.from(document.querySelectorAll('.tab'));
  tabNames.forEach((tab, index) => {
    tab.classList.remove('selected-tab');
    tabs[index].classList.add('hidden');
  });
  const id = tab.id.split('-')[1];
  tab.classList.add('selected-tab');
  document.querySelector(`#${id}`).classList.remove('hidden');
};

const main = () => {
  const tabs = document.querySelectorAll('.tab-name');
  tabs.forEach((tab) => tab.addEventListener('click', () => showTab(tab)));
};

window.onload = main;
