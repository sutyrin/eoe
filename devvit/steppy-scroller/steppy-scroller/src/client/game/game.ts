const button = document.getElementById('ping') as HTMLButtonElement | null;
const countEl = document.getElementById('count') as HTMLDivElement | null;

const render = (value: number) => {
  if (countEl) {
    countEl.textContent = String(value);
  }
};

const init = async () => {
  const response = await fetch('/api/init');
  if (!response.ok) {
    throw new Error('Failed to init');
  }
  const data = (await response.json()) as { count: number };
  render(data.count);
};

const increment = async () => {
  const response = await fetch('/api/increment', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to increment');
  }
  const data = (await response.json()) as { count: number };
  render(data.count);
};

if (button) {
  button.addEventListener('click', () => {
    void increment();
  });
}

void init();
