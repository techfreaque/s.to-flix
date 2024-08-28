browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    void browser.scripting.executeScript({
      target: { tabId },
      files: ["page-banner/self-test-overlay-script-loader.js"],
    });
    browser.runtime.onMessage.addListener(async (message) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (message.type === "autoLoadNextEpisode") {
        console.log("Received autoLoadNextEpisode");
        void chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            // eslint-disable-next-line prettier/prettier

            function getEpisodeAndSeasonFromUrl(): {
              seriesPath: string | undefined;
              season: string | undefined;
              episode: string | undefined;
            } {
              const [seriesPath, rest] =
                window.location.pathname.split("staffel-");
              const [season, episode] = rest?.split("/episode-") || [];
              return {
                seriesPath,
                season,
                episode,
              };
            }
            const { seriesPath, season, episode } =
              getEpisodeAndSeasonFromUrl();
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
          },
        });
      }
    });
  }
});
