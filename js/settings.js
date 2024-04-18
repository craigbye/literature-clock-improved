export function initBooleanSetting(name, defaultValue = false) {
  const urlParams = new URLSearchParams(window.location.search);
  let value = defaultValue;

  if (localStorage.getItem(name)) {
    value = localStorage.getItem(name) === "true";
  }

  if (urlParams.has(name)) {
    value = urlParams.get(name) === "true";
  }

  return value;
}

export function setBooleanSetting(name, value = false) {
  document.body.classList.toggle(name, value);
  localStorage.setItem(name, value);
  updateURL(name, value);
}

export function toggleBooleanSetting(name) {
  const value = !(localStorage.getItem(name) === "true");
  setBooleanSetting(name, value);
  return value;
}

export function updateBooleanSettingButtonStatus(name, value) {
  const button = document.getElementById(name);
  button.classList.toggle("active", value);
}

export function isBooleanSettingTrue(name) {
  return localStorage.getItem(name) === "true";
}

export function initStringSetting(name, defaultValue) {
  const urlParams = new URLSearchParams(window.location.search);
  let value = defaultValue;

  if (localStorage.getItem(name)) {
    value = localStorage.getItem(name);
  }

  if (urlParams.has(name)) {
    value = urlParams.get(name);
  }

  return value;
}

export function getStringSetting(name) {
  return localStorage.getItem(name);
}

export function setStringSetting(name, value) {
  localStorage.setItem(name, value);
  updateURL(name, value);
}

// deprecated
export function deleteUrlParamIfExistsAndRefresh(name) {
  /*const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has(name)) {
    urlParams.delete(name);
    window.location.search = urlParams.toString();
  }*/
}

function updateURL(name, value) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(name, value);

  history.replaceState({}, "", `?${urlParams.toString()}`)
}
