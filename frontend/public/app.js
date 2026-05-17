const screens = {
  login: document.querySelector('#login-screen'),
  warning: document.querySelector('#warning-screen'),
  captures: document.querySelector('#captures-screen')
};

const loginForm = document.querySelector('#login-form');
const viewCapturesButton = document.querySelector('#view-captures-button');
const backFromWarningButton = document.querySelector('#back-from-warning-button');
const homeButton = document.querySelector('#home-button');
const refreshButton = document.querySelector('#refresh-button');
const deleteButton = document.querySelector('#delete-button');
const tableBody = document.querySelector('#captures-table-body');
const emptyMessage = document.querySelector('#empty-message');
const toast = document.querySelector('#toast');

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('screen-active'));
  screens[name].classList.add('screen-active');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => {
    toast.classList.remove('visible');
  }, 2600);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || '요청 처리에 실패했습니다.');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date(value));
}

function renderCaptures(captures) {
  tableBody.innerHTML = '';
  emptyMessage.classList.toggle('visible', captures.length === 0);

  captures.forEach((capture) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(capture.created_at)}</td>
      <td>${escapeHtml(capture.identifier)}</td>
      <td>${escapeHtml(capture.password_mask)}</td>
      <td>${capture.password_length}</td>
      <td>${escapeHtml(capture.ip_address || '-')}</td>
    `;
    tableBody.appendChild(row);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadCaptures() {
  const captures = await requestJson('/api/captures');
  renderCaptures(captures);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const identifier = String(formData.get('identifier') || '').trim();
  const password = String(formData.get('password') || '');

  try {
    await requestJson('/api/captures', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    loginForm.reset();
    showScreen('warning');
  } catch (error) {
    showToast(error.message);
  }
});

viewCapturesButton.addEventListener('click', async () => {
  try {
    await loadCaptures();
    showScreen('captures');
  } catch (error) {
    showToast(error.message);
  }
});

refreshButton.addEventListener('click', async () => {
  try {
    await loadCaptures();
    showToast('정보를 새로 불러왔습니다.');
  } catch (error) {
    showToast(error.message);
  }
});

deleteButton.addEventListener('click', async () => {
  if (!window.confirm('저장된 모의 탈취 정보를 모두 삭제할까요?')) {
    return;
  }

  try {
    await requestJson('/api/captures', { method: 'DELETE' });
    await loadCaptures();
    showToast('저장된 정보가 삭제되었습니다.');
  } catch (error) {
    showToast(error.message);
  }
});

homeButton.addEventListener('click', () => {
  showScreen('login');
});

backFromWarningButton.addEventListener('click', () => {
  showScreen('login');
});
