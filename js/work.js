import { updateQuote } from "./quotes.js";
import {
  deleteUrlParamIfExistsAndRefresh,
  initBooleanSetting,
  setBooleanSetting,
  toggleBooleanSetting,
  updateBooleanSettingButtonStatus,
} from "./settings.js";

export function initWorkMode(defaultValue = false) {
  const value = initBooleanSetting("work", defaultValue);
  setBooleanSetting("work", value);
  updateBooleanSettingButtonStatus("work", value);

  document.getElementById("work").addEventListener("click", toggleWorkMode);
}

function toggleWorkMode() {
  const isWorkMode = toggleBooleanSetting("work");

  deleteUrlParamIfExistsAndRefresh("work");

  updateBooleanSettingButtonStatus("work", isWorkMode);
  const sfw = document.getElementById("quote").dataset.sfw;

  if (isWorkMode && sfw === "nsfw") {
    updateQuote();
  }
}
