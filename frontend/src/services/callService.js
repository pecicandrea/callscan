import { API_URL } from "./api";


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
