const API_URL = "http://127.0.0.1:8000";


export async function loginUser(email, password) {
  return fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
}


export async function registerUser(email, password) {
  return fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
}


export async function getCurrentUser(token) {
  return fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export async function getCalls(token) {
  return fetch(`${API_URL}/calls`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export async function uploadCall(token, file) {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`${API_URL}/calls/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}


export async function deleteCall(token, id) {
  return fetch(`${API_URL}/calls/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}