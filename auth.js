import { load, save, showToast } from './utils.js';
import { updateWho } from './ui.js';

export function setCurrentUser(u) {
  save("currentUser", u);
  updateWho();
}

export function getCurrentUser() {
  return load("currentUser", null);
}

export function doRegister() {
  const u = document.getElementById("reg_username").value.trim();
  const e = document.getElementById("reg_email").value.trim();
  const p = document.getElementById("reg_password").value.trim();
  if (!u || !e || !p) {
    alert("All fields required");
    return;
  }
  const users = load("users", []);
  if (users.find((x) => x.username === u)) {
    alert("Username already exists");
    return;
  }
  users.push({ username: u, email: e, password: p });
  save("users", users);
  setCurrentUser({ username: u, email: e });
  alert("Registered and logged in!");
  showToast("Logged in as " + u);
}

export function doLogin() {
  const u = document.getElementById("reg_username").value.trim();
  const p = document.getElementById("reg_password").value.trim();
  const users = load("users", []);
  const found = users.find((x) => x.username === u && x.password === p);
  if (!found) {
    alert("Invalid credentials");
    return;
  }
  setCurrentUser({ username: found.username, email: found.email });
  alert("Logged in!");
  showToast("Welcome " + found.username);
}