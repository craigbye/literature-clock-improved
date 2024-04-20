import { getRandomLocale } from "./locales.js";
import { getStringSetting, isBooleanSettingTrue } from "./settings.js";
import { setTheme } from "./themes.js";
import TRANSLATIONS from "./translations.js";
import { FALLBACK_QUOTES, fitQuote, getTime, updateGHLinks } from "./utils.js";

async function getQuotes(time, locale) {
  const fileName = time.replace(":", "_");
  try {
    const response = await fetch(`../times/${locale}/${fileName}.json`);

    if (!response.ok) {
      return FALLBACK_QUOTES[locale];
    }

    let quotes = await response.json();

    if (isBooleanSettingTrue("work")) {
      quotes = quotes.filter((q) => q.sfw !== "nsfw");
    }

    if (!quotes.length) {
      return FALLBACK_QUOTES[locale];
    }

    return quotes;
  } catch (error) {
    return FALLBACK_QUOTES[locale];
  }
}

async function getQuote(time, locale) {
  const quotes = await getQuotes(time, locale);
  const urlParams = new URLSearchParams(window.location.search);
  const quoteIndex = Math.floor(Math.random() * quotes.length);
  const quote = Object.assign({}, quotes[quoteIndex]);

  if (!quote.quote_time_case) {
    quote.time = time;
    quote.quote_time_case = time;
  }

  if (urlParams.get("quote")) {
    quote.title = TRANSLATIONS[locale].title;
    quote.author = TRANSLATIONS[locale].author;
  }

  return quote;
}

export async function updateQuote(time = getTime()) {
  const clock = document.getElementById("clock");
  const urlParams = new URLSearchParams(window.location.search);
  const testQuote = urlParams.get("quote");
  let locale = getStringSetting("locale");

  if (getStringSetting("locale") === "random") {
    locale = getRandomLocale();
  }

  if (getStringSetting("theme").includes("color")) {
    setTheme();
  }

  const quote = await getQuote(time, locale);
  updateGHLinks(time, quote, locale);
  const quoteText =
    testQuote ||
    `${quote.quote_first}<span class="time">${quote.quote_time_case}</span>${quote.quote_last}`;

  const blockquote = document.createElement("blockquote");
  blockquote.id = "quote";

  const p = document.createElement("p");
  p.innerHTML = quoteText.replace(/\n/g, "<br>");

  const cite = document.createElement("cite");
  cite.innerText = `— ${quote.title}, ${quote.author}`;

  blockquote.appendChild(p);
  blockquote.appendChild(cite);
  blockquote.setAttribute("aria-label", quote.time);
  blockquote.dataset.sfw = quote.sfw;

  if (quote.quote_raw) {
    blockquote.setAttribute(
      "aria-description",
      quote.quote_raw.replace(/<br>|\n/g, " ")
    );
  }

  clock.innerHTML = "";
  clock.appendChild(blockquote);

  fitQuote();
}
