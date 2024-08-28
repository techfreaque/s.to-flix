document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  document
    .getElementById("autoPlay")
    ?.addEventListener("change", () => autoSaveToggle("autoPlay"));
  document
    .getElementById("autoPauseInactivity")
    ?.addEventListener("change", () => autoSaveNumber("autoPauseInactivity"));
  document
    .getElementById("autoLoadNextEpisode")
    ?.addEventListener("input", () => autoSaveToggle("autoLoadNextEpisode"));
  document
    .getElementById("autoPause")
    ?.addEventListener("input", () => autoSaveToggle("autoPause"));
});
// Function to load settings when the popup is opened
function loadSettings(): void {
  browserAPI.storage.sync.get(
    ["autoPlay", "autoPauseInactivity", "autoLoadNextEpisode", "autoPause"],
    (result) => {
      (document.getElementById("autoPlay") as HTMLInputElement).checked =
        result["autoPlay"] === undefined ? true : result["autoPlay"];
      (
        document.getElementById("autoLoadNextEpisode") as HTMLInputElement
      ).checked =
        result["autoPause"] === undefined ? true : result["autoPause"];
      (document.getElementById("autoPause") as HTMLInputElement).checked =
        result["autoPause"] === undefined ? true : result["autoPause"];
      (
        document.getElementById("autoPauseInactivity") as HTMLInputElement
      ).value =
        result["autoPauseInactivity"] === undefined
          ? 60
          : result["autoPauseInactivity"];
    },
  );
}

// Function to auto-save toggle switch settings
function autoSaveToggle(elementId: string): void {
  const settingValue = (document.getElementById(elementId) as HTMLInputElement)
    .checked;
  browserAPI.storage.sync.set({ [elementId]: settingValue }, () => {
    console.log(`${elementId} setting auto-saved`);
  });
}

// Function to auto-save number input settings
function autoSaveNumber(elementId: string): void {
  const settingValue = (document.getElementById(elementId) as HTMLInputElement)
    .value;
  browserAPI.storage.sync.set({ [elementId]: settingValue }, () => {
    console.log(`${elementId} setting auto-saved`);
  });
}

export const browserAPI = (
  typeof browser === "undefined" ? chrome : browser
) as typeof chrome;
