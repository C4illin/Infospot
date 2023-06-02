let txtColor = "white";
let progress = 0;

function colorElements(timeData, element) {
  timeData.forEach((beat) => {
    const start = beat.start - progress / 1000;
    if (start < 0) {
      return;
    }
    setTimeout(() => {
      element.style.backgroundColor = txtColor;
    }, start * 1000);
    setTimeout(() => {
      element.style.backgroundColor = "";
    }, start * 1000 + 100);
  });
}

const analysis = (data) => {
  const sectionsElem = document.querySelectorAll("div#sections > div > div:first-child")
  const segments = data.segments;
  const sections = data.sections;

  sections.forEach((section, index) => {
    const start = section.start - progress / 1000;

    if (start < 0) {
      return;
    }

    setTimeout(() => {
      const fill = [index+1, section.loudness, section.tempo, section.key, section.mode, section.time_signature + "/4"]
      sectionsElem.forEach((elem, index) => {
        elem.textContent = fill[index];
      })
    }, start * 1000);
  });

  colorElements(data.tatums, document.getElementById("tatums"));
  colorElements(data.beats, document.getElementById("beats"));
  colorElements(data.bars, document.getElementById("bars"));

  const pitchesData = {
    labels: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
    datasets: [{
      label: "Pitches",
      data: segments[0].pitches,
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 1
    }]
  };

  const timbreData = {
    labels: ["dB", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    datasets: [{
      label: "Timbre",
      data: segments[0].timbre,
      backgroundColor: "rgba(99, 132, 255, 0.2)",
      borderColor: "rgba(99, 132, 255, 1)",
      borderWidth: 1
    }]
  }

  const pitchesOptions = {
    animation: {
      duration: 500
    },
    color: txtColor,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };

  const timbreOptions = {
    animation: {
      duration: 500
    },
    color: txtColor,
    scales: {
      y: {
        min: -200,
        max: 200,
      }
    }
  }

  const pitchesChart = new Chart(document.getElementById("chart1"), {
    type: "bar",
    data: pitchesData,
    options: pitchesOptions
  });

  const timbreChart = new Chart(document.getElementById("chart2"), {
    type: "bar",
    data: timbreData,
    options: timbreOptions
  });

  const updateChart = (pitches, timbre) => {
    pitchesChart.data.datasets[0].data = pitches
    timbreChart.data.datasets[0].data = timbre
    pitchesChart.update();
    timbreChart.update();
  };

  segments.forEach((segment, index) => {
    const start = segment.start - progress / 1000;

    if (start < 0) {
      return;
    }

    setTimeout(() => {
      updateChart(segment.pitches, segment.timbre)
    }, start * 1000 + 50);
  });
}


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

const colorThief = new ColorThief();
const img = document.querySelector('img');

const colorHandler = (color) => {

  if (color[0] > 200 && color[1] > 200 && color[2] > 200) {
    document.documentElement.style.setProperty('--text', 'black');
    txtColor = "black";
  } else {
    document.documentElement.style.setProperty('--text', 'white');
  }

  document.documentElement.style.setProperty('--bkg', 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')');
}

if (img.complete) {
  colorHandler(colorThief.getColor(img));
} else {
  img.addEventListener('load', function () {
    colorHandler(colorThief.getColor(img));
  });
}

const getData = (data) => {
  const progresstext = document.getElementById("progresstext");

  updateProgress(data.track.timestamp, data.track.item.duration_ms, progresstext);
  analysis(data.analysis);

  // change favicon
  const link = document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "shortcut icon";
  link.href = data.track.item.album.images[2].url
  document.head.appendChild(link);
}
