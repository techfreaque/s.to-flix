document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  document
    .getElementById("autoPlay")
    ?.addEventListener("change", () => autoSaveToggle("autoPlay"));
  document
    .getElementById("autoPauseInactivity")
    ?.addEventListener("input", () => autoSaveNumber("autoPauseInactivity"));
  document
    .getElementById("autoLoadNextEpisode")
    ?.addEventListener("change", () => autoSaveToggle("autoLoadNextEpisode"));
  document
    .getElementById("autoPause")
    ?.addEventListener("change", () => autoSaveToggle("autoPause"));
  document
    .getElementById("autoFullscreen")
    ?.addEventListener("change", () => autoSaveToggle("autoFullscreen"));
});
function loadSettings() {
  chrome.storage.local.get(
    [
      "autoPlay",
      "autoPauseInactivity",
      "autoLoadNextEpisode",
      "autoPause",
      "autoFullscreen",
    ],
    async (result) => {
      if (!result) {
        console.log("Result is empty");
        return;
      }
      loadCheckBoxValue("autoPlay", true, result);
      loadCheckBoxValue("autoLoadNextEpisode", true, result);
      loadCheckBoxValue("autoPause", true, result);
      loadCheckBoxValue("autoFullscreen", true, result);
      loadInputValue("autoPauseInactivity", 60, result);
    },
  );
}

function loadCheckBoxValue(
  elementId: string,
  defValue: boolean,
  result: { [key: string]: boolean },
): void {
  (document.getElementById(elementId) as HTMLInputElement).checked =
    result[elementId] === undefined ? defValue : result[elementId];
  console.log("Loaded value:", elementId, result[elementId]);
}

function loadInputValue(
  elementId: string,
  defValue: number,
  result: { [key: string]: number },
): void {
  (document.getElementById(elementId) as HTMLInputElement).value = String(
    result[elementId] === undefined ? defValue : result[elementId],
  );
  console.log("Loaded value:", elementId, result[elementId]);
}

function autoSaveToggle(elementId: string) {
  const settingValue = (document.getElementById(elementId) as HTMLInputElement)
    .checked;
  chrome.storage.local.set({ [elementId]: settingValue }, () => {
    console.log(`${elementId} setting auto-saved`);
  });
}
function autoSaveNumber(elementId: string) {
  const settingValue = (document.getElementById(elementId) as HTMLInputElement)
    .value;
  chrome.storage.local.set({ [elementId]: settingValue }, () => {
    console.log(`${elementId} setting auto-saved`);
  });
}

export const browserAPI = (
  typeof browser === "undefined" ? chrome : browser
) as typeof chrome;
