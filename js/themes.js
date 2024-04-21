import { initStringSetting, setStringSetting, updateURL } from "./settings.js";
import { fitQuote } from "./utils.js";

const THEME_FONTS = {
  retro: "VT323",
  elegant: "Playfair Display",
  festive: "Borel",
  bohemian: "Comfortaa",
  handwriting: "Reenie Beanie",
  anaglyph: "Anton",
  whatsapp: "Roboto",
  terminal: "B612 Mono",
};

function loadFontIfNotExists(theme) {
  if (THEME_FONTS[theme]) {
    const fontNameSanitized = THEME_FONTS[theme].replace(/ /g, "+");
    const fontExists = Array.from(
      document.querySelectorAll("link[rel=stylesheet][href*=fonts]")
    ).some((link) => link.href.includes(fontNameSanitized));

    if (fontExists) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontNameSanitized}:wght@400&display=swap`;
    document.head.appendChild(link);
  }
}

function getRandomThemeColor() {
  let colors = Array.from(document.querySelectorAll("#colors option")).map(
    (op) => op.value
  );
  const [themePrefix] = document.documentElement.dataset.theme.split("-");

  colors.pop();
  colors = colors.filter((color) => color !== themePrefix);

  return colors[Math.floor(Math.random() * colors.length)];
}

export function initTheme(defaultValue = "base-dark") {
  let [theme, variant = "system"] = initStringSetting(
    "theme",
    defaultValue
  ).split("-");
  const themeSelect = document.getElementById("theme-select");
  const variantSelect = document.getElementById("variant-select");
  const preferDarkThemes = window.matchMedia("(prefers-color-scheme: dark)");

  setStringSetting("theme", `${theme}-${variant}`);
  loadFontIfNotExists(theme);
  themeSelect.value = theme;
  variantSelect.value = variant;

  if (theme === "color") {
    theme = getRandomThemeColor();
  }
  if (variant === "system") {
    variant = preferDarkThemes.matches ? "dark" : "light";
  }
  document.documentElement.dataset.theme = `${theme}-${variant}`;

  themeSelect.addEventListener("change", setTheme);
  variantSelect.addEventListener("change", setTheme);
  preferDarkThemes.addEventListener("change", (e) => {
    const variant = document.getElementById("variant-select").value;

    if (variant === "system") {
      const theme = document.getElementById("theme-select").value;

      setStringSetting("theme", `${theme}-system`);
      document.documentElement.dataset.theme = `${theme}-${
        e.matches ? "dark" : "light"
      }`;
    }
  });
}

export function setTheme(e) {
  let theme = document.getElementById("theme-select").value;
  let variant = document.getElementById("variant-select").value;

  loadFontIfNotExists(theme);
  setStringSetting("theme", `${theme}-${variant}`);
  updateURL("theme", `${theme}-${variant}`);

  if (theme === "color") {
    theme = getRandomThemeColor();
  }
  if (variant === "system") {
    variant = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  document.documentElement.dataset.theme = `${theme}-${variant}`;
  setInterval(fitQuote, 10);
}
