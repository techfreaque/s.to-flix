const browserAPI = (
  typeof browser === "undefined" ? chrome : browser
) as typeof chrome;

browserAPI.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    browserAPI.runtime.onMessage.addListener((message) => {
      console.log("Received message:", message.type);
      if (message.type === "autoLoadNextEpisode") {
        executeFunctionIfAutoLoadNextEpisodeIsEnabled(async () => {
          await chrome.scripting.executeScript({
            target: { tabId },
            func: loadNextEpisode,
          });
        });
      } else if (message.type === "autoFullscreen") {
        void chrome.scripting.executeScript({
          target: { tabId },
          func: enableFullscreen,
        });
      }
    });
  }
});

function enableFullscreen() {
  const videoIFrame = document.querySelector(".inSiteWebStream")
    ?.firstElementChild?.firstElementChild as HTMLIFrameElement | undefined;
  if (videoIFrame) {
    const disableFullscreenButton = document.createElement("button");
    disableFullscreenButton.style.position = "fixed";
    disableFullscreenButton.style.top = "20px";
    disableFullscreenButton.style.left = "50%";
    disableFullscreenButton.style.zIndex = "99999";
    disableFullscreenButton.innerText = "Exit Fullscreen (ESC)";
    disableFullscreenButton.onclick = () => {
      document.body.style.overflow = "";
      videoIFrame.style.position = "";
      videoIFrame.style.top = "";
      videoIFrame.style.left = "";
      videoIFrame.style.width = "";
      videoIFrame.style.height = "";
      videoIFrame.style.zIndex = "";
    };
    document.body.appendChild(disableFullscreenButton);
    document.body.style.overflow = "hidden";
    videoIFrame.style.position = "fixed";
    videoIFrame.style.top = "0";
    videoIFrame.style.left = "0";
    videoIFrame.style.width = "100vw";
    videoIFrame.style.height = "100vh";
    videoIFrame.style.zIndex = "9999";
    console.log("videoIframe found - fullscreen started");
  } else {
    console.log("No videoIframe found to fullscreen");
  }
}
function loadNextEpisode() {
  function getEpisodeAndSeasonFromUrl() {
    const [seriesPath, rest] = window.location.pathname.split("staffel-");
    const [season, episode] = rest?.split("/episode-") || [];
    return {
      seriesPath,
      season,
      episode,
    };
  }
  const { seriesPath, season, episode } = getEpisodeAndSeasonFromUrl();
  console.log({ seriesPath, season, episode });
  if (season && episode) {
    const nextEpisodeInThisSeason = document.querySelector(
      `[title="Staffel ${season} Episode ${Number(episode) + 1}"]`,
    );
    console.log("nextEpisodeInThisSeason", nextEpisodeInThisSeason);
    if (nextEpisodeInThisSeason) {
      window.location.replace(
        `${seriesPath}staffel-${season}/episode-${Number(episode) + 1}`,
      );
    } else {
      const nextSeason = document.querySelector(
        `[title="Staffel ${Number(season) + 1}"]`,
      );
      console.log("nextSeason", nextSeason);
      if (nextSeason) {
        window.location.replace(
          `${seriesPath}staffel-${Number(season) + 1}/episode-1`,
        );
      } else {
        console.log("no next season");
      }
    }
  }
}
function executeFunctionIfAutoLoadNextEpisodeIsEnabled(
  fn: () => Promise<void>,
) {
  browserAPI.storage.local.get(
    ["autoPlay", "autoLoadNextEpisode", "autoFullscreen"],
    async (result) => {
      const autoLoadNextEpisode =
        result?.["autoLoadNextEpisode"] === undefined
          ? true
          : result?.["autoLoadNextEpisode"];
      console.log("autoLoadNextEpisode is:", autoLoadNextEpisode);
      autoLoadNextEpisode && (await fn());
    },
  );
}
