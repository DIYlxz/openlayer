// webStorage.js
const locaMap = "locaMap";

export function getMap() {
  return localStorage.getItem(locaMap) ? localStorage.getItem(locaMap) : "0";
}

export function setMap(e) {
  return localStorage.setItem(locaMap, e);
}