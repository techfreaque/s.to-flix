addSetLastActivityTimeEvent();

interface Settings {
  autoPlay: boolean;
  autoLoadNextEpisode: boolean;
  autoFullscreen: boolean;
  autoPause: boolean;
}

getSettingsAndExecuteFunction(
  async ({
    autoPlay,
    autoLoadNextEpisode,
    autoFullscreen,
    autoPause,
  }: Settings) => {
    console.log("autoPlay is", autoPlay);
    console.log("autoPause is", autoPause);
    console.log("autoLoadNextEpisode is", autoLoadNextEpisode);
    console.log("autoFullscreen is", autoFullscreen);
    const video = await getVideoElement();
    if (video) {
      console.log("Video found on ", window.location.href);
      if (autoPlay) {
        await autoPlayVideo(video);
      } else {
        await pauseVideo(video);
      }
      if (autoFullscreen) {
        autoFullscreenVideo();
      }
      addAutoLoadNextEpisodeEvent(video);
      infiniteCheckForAutoPause(video);
    } else {
      console.log("Video not found on ", window.location.href);
    }
  },
);
async function getVideoElement(): Promise<HTMLVideoElement | undefined> {
  const startTime = Date.now();
  const timeout = 10_000;
  while (Date.now() - startTime < timeout) {
    const videoElement = (document.getElementById("voe-player") ||
      document.getElementById("player_html5_api") ||
      document.querySelector("media-player > media-provider > video")) as
      | HTMLVideoElement
      | undefined;
    if (videoElement) {
      return videoElement;
    }
    await pressVoePlayButton();
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return undefined;
}
function addAutoLoadNextEpisodeEvent(video: HTMLVideoElement) {
  video.addEventListener("ended", () => {
    console.log("A video has ended.");
    void chrome.runtime.sendMessage({
      type: "autoLoadNextEpisode",
    });
  });
}
async function autoPlayVideo(video: HTMLVideoElement) {
  if (video) {
    try {
      await video.play();
    } catch (e) {
      try {
        console.log("Failed to play video, trying again shortly:", e);
        await new Promise((resolve) => setTimeout(resolve, 200));
        await video.play();
      } catch (e) {
        try {
          console.log("Failed to play video, trying again muted:", e);
          video.muted = true;
          await video.play();
        } catch (e) {
          console.log("Failed to play video:", e);
        }
      }
    }
    console.log("Started video on:", window.location.href);
  }
}
async function pauseVideo(video: HTMLVideoElement) {
  if (video) {
    try {
      video.pause();
      await new Promise((resolve) => setTimeout(resolve, 500));
      video.pause();
    } catch (e) {
      return;
    }
    console.log("Started paused on:", window.location.href);
  }
}
async function pressVoePlayButton() {
  const voePlayButton = document.getElementsByTagName(
    "media-play-button",
  )?.[0] as HTMLButtonElement | undefined;
  if (voePlayButton) {
    voePlayButton.click();
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}
function autoFullscreenVideo() {
  void chrome.runtime.sendMessage({
    type: "autoFullscreen",
  });
}
function infiniteCheckForAutoPause(video: HTMLVideoElement) {
  const browserAPI = typeof browser === "undefined" ? chrome : browser;
  const checkAndPause = () => {
    browserAPI.storage.local.get(
      ["autoPauseInactivity", "autoPause", "lastActivity"],
      async (result) => {
        const autoPause =
          result?.["autoPause"] === undefined ? true : result?.["autoPause"];
        const autoPauseInactivity =
          result?.["autoPauseInactivity"] === undefined
            ? 60
            : result?.["autoPauseInactivity"];
        const lastActivity = result?.["lastActivity"];
        if (autoPause && lastActivity) {
          const autoPauseInactivityInMilliSeconds =
            autoPauseInactivity * 60 * 1000;
          const inactiveSince = Date.now() - lastActivity;
          console.log(
            "inactiveSinceSeconds",
            inactiveSince / 1000,
            "seconds, autoPauseInactivityInSeconds:",
            autoPauseInactivityInMilliSeconds / 1000,
          );
          if (inactiveSince > autoPauseInactivityInMilliSeconds) {
            console.log("Paused because of inactivity");
            video.pause();
            await new Promise((resolve) => setTimeout(resolve, 1000));
            video.pause();
          }
        }
      },
    );
  };
  setInterval(checkAndPause, 8000);
}
function addSetLastActivityTimeEvent() {
  function throttle(func: () => void) {
    let inThrottle = false;
    return () => {
      if (!inThrottle) {
        func();
        inThrottle = true;
        setTimeout(() => (inThrottle = false), 2000);
      }
    };
  }
  const browserAPI = typeof browser === "undefined" ? chrome : browser;
  function storeLastActivity() {
    browserAPI.storage.local.set({ lastActivity: Date.now() }, () => {
      console.log("Last activity set");
    });
  }
  const throttledHandleEvent = throttle(storeLastActivity);
  window.addEventListener("mousemove", throttledHandleEvent);
  window.addEventListener("keydown", throttledHandleEvent);
}
function getSettingsAndExecuteFunction(
  fn: (settings: Settings) => Promise<void>,
) {
  const browserAPI = typeof browser === "undefined" ? chrome : browser;
  browserAPI.storage.local.get(
    ["autoPlay", "autoLoadNextEpisode", "autoFullscreen", "autoPause"],
    async (result) => {
      const autoPlay =
        result?.["autoPlay"] === undefined ? true : result?.["autoPlay"];
      const autoLoadNextEpisode =
        result?.["autoLoadNextEpisode"] === undefined
          ? true
          : result?.["autoLoadNextEpisode"];
      const autoFullscreen =
        result?.["autoFullscreen"] === undefined
          ? true
          : result?.["autoFullscreen"];
      const autoPause =
        result?.["autoPause"] === undefined ? true : result?.["autoPause"];
      await fn({ autoPlay, autoLoadNextEpisode, autoFullscreen, autoPause });
    },
  );
}
