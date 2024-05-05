import { startScreensaver } from "./screensaver.js";
import { isBooleanSettingTrue } from "./settings.js";

export const FALLBACK_QUOTES = {
  "en-US": [
    {
      quote_first: "Error ",
      quote_last: ": quote not found.",
      title: "Internet Explorer",
      author: "1995-2022",
      sfw: true,
    },
    {
      quote_first: "Captain's log:<br>We are still looking for a quote for ",
      quote_last: ".",
      title: "Moby Dick",
      author: "Captain Ahab",
      sfw: true,
    },
  ],
  "es-ES": [
    {
      quote_first: "Error ",
      quote_last: ": quote not found.",
      title: "Internet Explorer",
      author: "1995-2022",
      sfw: true,
    },
    {
      quote_first:
        "Bitácora del Capitán:<br>Seguimos buscando una cita para las ",
      quote_last: ".",
      title: "Moby Dick",
      author: "Captain Ahab",
      sfw: true,
    },
  ],
  "pt-BR": [
    {
      quote_first: "Erro ",
      quote_last: ": citação não encontrada.",
      title: "Internet Explorer",
      author: "1995-2022",
      sfw: true,
    },
    {
      quote_first:
        "Registro do capitão:<br>Ainda estamos procurando uma data para o ",
      quote_last: ".",
      title: "Moby Dick",
      author: "Capitão Ahab",
      sfw: true,
    },
  ],
  "fr-FR": [
    {
      quote_first: "Erreur ",
      quote_last: ": citation non trouvée.",
      title: "Internet Explorer",
      author: "1995-2022",
      sfw: true,
    },
    {
      quote_first:
        "Journal du capitaine:<br>Nous sommes toujours à la recherche d'una citation pour ",
      quote_last: ".",
      title: "Moby Dick",
      author: "Capitaine Achab",
      sfw: true,
    },
  ],
  "it-IT": [
    {
      quote_first: "Errore ",
      quote_last: ": citazione non trovata.",
      quote_time_case: ".",
      title: "Internet Explorer",
      author: "1995-2022",
      sfw: true,
    },
    {
      quote_first:
        "Diario del capitano:<br>Stiamo ancora cercando una data per il ",
      quote_last: ".",
      title: "Moby Dick",
      author: "Capitano Achab",
      sfw: true,
    },
  ],
};

const INITIAL_THEME_FONT_SIZE = {
  handwriting: 90,
  whatsapp: 45,
  retro: 70,
  frame: 35,
};
const GITHUT_NEW_ISSUE_URL =
  "https://github.com/cdmoro/literature-clock/issues/new";

export function getTime() {
  const urlParams = new URLSearchParams(window.location.search);
  const testTime = urlParams.get("time");
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  return (
    testTime ||
    `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`
  );
}

export function updateGHLinks(time, quote, locale) {
  const quoteRaw = `${quote.quote_first}${quote.quote_time_case}${quote.quote_last}`;

  const addQuoteUrl = new URL(GITHUT_NEW_ISSUE_URL);
  addQuoteUrl.searchParams.set("template", `add-quote.yml`);
  addQuoteUrl.searchParams.set("assignees", "cdmoro");
  addQuoteUrl.searchParams.set("title", `[${time}][${locale}] Add quote`);
  addQuoteUrl.searchParams.set("labels", `add-quote,${locale}`);
  addQuoteUrl.searchParams.set("locale", locale);

  const addQuoteLink = document.getElementById("add-quote");
  addQuoteLink.href = addQuoteUrl.href;

  const reportErrorUrl = new URL(GITHUT_NEW_ISSUE_URL);
  reportErrorUrl.searchParams.set("template", `quote-error.yml`);
  reportErrorUrl.searchParams.set("assignees", "cdmoro");
  reportErrorUrl.searchParams.set(
    "title",
    `[${time}][${locale}]${quote.id ? `[${quote.id}]` : ""} Report error`
  );
  reportErrorUrl.searchParams.set("labels", `bug,${locale}`);
  reportErrorUrl.searchParams.set("locale", locale);
  reportErrorUrl.searchParams.set("time", time);
  reportErrorUrl.searchParams.set("book", quote.title);
  reportErrorUrl.searchParams.set("author", quote.author);
  reportErrorUrl.searchParams.set("quote", quoteRaw.replace(/<br>/g, " "));

  const reportError = document.getElementById("report-error");
  reportError.href = reportErrorUrl.href;
}

export function doFitQuote() {
  const [theme] = document.documentElement.dataset.theme.split("-");
  const quote = document.querySelector("blockquote p");
  const cite = document.querySelector("blockquote cite");
  let fontSize = INITIAL_THEME_FONT_SIZE[theme] || 75;

  if (quote) {
    quote.style.fontSize = `${fontSize}px`;
    const safeClientHeight = quote.clientHeight - 10;

    while (quote.scrollHeight > safeClientHeight) {
      quote.style.fontSize = `${fontSize}px`;
      cite.style.fontSize = `${fontSize < 19 ? 10 : fontSize * 0.7}px`;
      fontSize -= 1;

      if (fontSize < 10) {
        quote.style.fontSize = `10px`;
        break;
      }
    }
  }
}

export function fitQuote() {
  const interval = setInterval(doFitQuote, 1);
  setTimeout(() => {
    clearInterval(interval);

    if (isBooleanSettingTrue("screensaver")) {
      startScreensaver();
    }
  }, 500);
}

export function loadFontIfNotExists(font) {
  const fontNameSanitized = font.replace(/ /g, "+");
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
