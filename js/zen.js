import {
  deleteUrlParamIfExistsAndRefresh,
  initBooleanSetting,
  setBooleanSetting,
} from "./settings.js";

export function initZenMode(defaultValue = false) {
  const value = initBooleanSetting("zen", defaultValue);
  setBooleanSetting("zen", value);

  document.getElementById("zen").addEventListener("click", () => {
    setBooleanSetting("zen", true);
    deleteUrlParamIfExistsAndRefresh("zen");
  });
  document.getElementById("exit-zen").addEventListener("click", () => {
    setBooleanSetting("zen", false);
    deleteUrlParamIfExistsAndRefresh("zen");
  });
}
