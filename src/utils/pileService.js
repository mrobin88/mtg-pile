const BASE_URL = '/api/pile';

function create(pile) {
  return fetch(`${BASE_URL}/create`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(pile)
  }).then(res => res.json());
}

function getAll() {
  return fetch(`${BASE_URL}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }).then(res => res.json());
}

function deletePile(pileId) {
  return fetch(`${BASE_URL}/${pileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }).then(res => res.json());
}

const pileService = {
  create,
  getAll,
  deletePile
};

export default pileService;