const MOON_PHASES = ["new", "waxing-crescent", "first-quarter", "waxing-gibbous", "full-moon", "waning gibbous", "third-quarter", "waning crescent"];
const moonPhase = MOON_PHASES[Math.floor(Math.random() * MOON_PHASES.length)];

export function getDayProgress() {
  const now = new Date();
  const seconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const progress = (seconds * 100) / 86400;

  return parseFloat(progress.toFixed(2));
}

export function getDayParameters() {
  const progress = getDayProgress();
  let scene = "night";

  if (progress >= 25 && progress < 50) {
    scene = "sunrise";
  } else if (progress >= 50 && progress < 75) {
    scene = "sunset";
  } else if (progress >= 75) {
    scene = "dusk";
  }

  const opacity = parseFloat(
    (progress <= 50 ? progress / 50 : 1 - (progress / 50 - 1)).toFixed(2)
  );

  // const actorLeft =
    // progress <= 25 ? (progress * 100) / 25 : ((progress - 25) * 100) / 75;
  const actorLeft = progress >= 25 && progress <=75 ? ((progress - 25) * 100) / 50 : progress > 75 ? ((progress-75) * 50) / 25 : ((progress + 25) * 100) / 50 ;
  

  return {
    scene,
    opacity,
    progress,
    actorLeft,
  };
}

export function setDayParameters() {
  const { opacity, progress, scene, actorLeft } = getDayParameters();

  if (!document.querySelector(".actor")) {
    const actor = document.createElement("div");
    actor.classList.add("actor");
    document.querySelector("main")?.appendChild(actor);
  }

  const root = document.querySelector<HTMLElement>(":root");
  root?.style.setProperty("--day-opacity", opacity.toString());
  root?.style.setProperty("--actor-left", actorLeft.toString());
  root?.style.setProperty("--day-progress", progress.toString());
  root?.style.setProperty("--moon-phase", moonPhase);
  root?.setAttribute("data-progress", progress.toString());
  root?.setAttribute("data-scene", scene);
}
