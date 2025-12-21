const button = document.getElementById('ping') as HTMLButtonElement | null;
const countEl = document.getElementById('count') as HTMLDivElement | null;

let count = 0;

const render = () => {
  if (countEl) {
    countEl.textContent = String(count);
  }
};

if (button) {
  button.addEventListener('click', () => {
    count += 1;
    render();
  });
}

render();
