const strobe = (data) => {
  const tatumsElem = document.getElementById("strobe");
  const tatums = data.tatums;

  tatums.forEach((tatum) => {
    const start = tatum.start - progress / 1000;
    const end = start + tatum.duration;

    if (start < 0) {
      return;
    }

    setTimeout(() => {
      tatumsElem.style.backgroundColor = "black";
    }, start * 1000 + 100);

    setTimeout(() => {
      tatumsElem.style.backgroundColor = "white";
    }, end * 1000);
  });
}

let progress = 0;
const updateProgress = (timestamp, duration, element) => {
  progress = (Date.now() - timestamp);
  element.textContent = `${formatMs(progress)} / ${formatMs(duration)}`;

  if (progress >= duration) {
    location.reload();
    return;
  }

  setTimeout(() => {
    updateProgress(timestamp, duration, element);
  }, 10);
}

const formatMs = (ms) => {
  let minutes = Math.floor(ms / 60000);
  let seconds = ((ms % 60000) / 1000).toFixed(0);
  let milliseconds = ms % 1000;
  return `${minutes}:${(seconds < 10 ? "0" : "")}${seconds}:${(milliseconds < 100 ? "0" : "")}${(milliseconds < 10 ? "0" : "")}${milliseconds}`;
}

const strobeData = (data) => {
  const progresstext = document.getElementById("progresstext");

  updateProgress(data.track.timestamp, data.track.item.duration_ms, progresstext);
  strobe(data.analysis);

  // change favicon
  const link = document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "shortcut icon";
  link.href = data.track.item.album.images[2].url
  document.head.appendChild(link);
}
