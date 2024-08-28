// eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-unused-vars
chrome.storage.sync.get(["autoPlay"], async () =>
  // result
  {
    const autoPlay = true; // result?.["autoPlay"];
    const autoLoadNextEpisode = true; // result?.["autoLoadNextEpisode"];
    // if (!autoPlay) {
    //   console.log("no autoPlay");
    //   // return;
    // }
    const video = getVideoElement();
    if (video) {
      autoPlay && (await autoPlayVideo(video));
      autoLoadNextEpisode && sendAutoLoadNextEpisodeEvent(video);
    } else {
      console.log("Video not found on ", window.location.href);
    }
  },
);

function getVideoElement(): HTMLVideoElement | null {
  const video: HTMLVideoElement | null = (document.getElementById(
    "voe-player",
  ) || document.getElementById("player_html5_api")) as HTMLVideoElement | null; // todo streamtape || document.getElementById("mainvideo")
  return video;
}

function sendAutoLoadNextEpisodeEvent(video: HTMLVideoElement): void {
  video.addEventListener("ended", () => {
    console.log("A video has ended.");
    void chrome.runtime.sendMessage({
      type: "autoLoadNextEpisode",
    });
  });
}

async function autoPlayVideo(video: HTMLVideoElement): Promise<void> {
  if (video) {
    try {
      await video.play();
    } catch (e) {
      video.muted = true;
      await video.play();
    }
    console.log("Started video on:", window.location.href);
  }
}
