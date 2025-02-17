document.getElementById("save").addEventListener("click", () => {
  const zip = document.getElementById("zip").value.trim();
  const errorDiv = document.getElementById("error");
  const zipRegex = /^\d{5}$/;

  errorDiv.style.display = "none";

  if (zipRegex.test(zip)) {
    chrome.storage.sync.set({ userZip: zip }, () => {
      errorDiv.textContent = `Zip code saved: ${zip}`;
      errorDiv.style.color = "green";
      errorDiv.style.display = "block";
    });
  } else {
    errorDiv.textContent = "Invalid zip code. Must be 5 digits.";
    errorDiv.style.color = "red";
    errorDiv.style.display = "block";
  }
});

chrome.storage.sync.get("userZip", (data) => {
  if (data.userZip) document.getElementById("zip").value = data.userZip;
});