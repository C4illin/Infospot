const analysis = (data, progress_ms) => {
  const barsElem = document.getElementById("bars");
  const beatsElem = document.getElementById("beats");
  const tatumsElem = document.getElementById("tatums");
  const bars = data.bars;
  const beats = data.beats;
  const tatums = data.tatums;
  const segments = data.segments;

  tatums.forEach((beat, index) => {
    const start = beat.start - progress / 1000;
    const end = start + beat.duration;

    if (start < 0) {
      return;
    }

    setTimeout(() => {
      tatumsElem.style.backgroundColor = "";
    }, start * 1000 + 50);

    setTimeout(() => {
      tatumsElem.style.backgroundColor = txtColor;
    }, end * 1000);
  });

  beats.forEach((beat, index) => {
    const start = beat.start - progress / 1000;
    const end = start + beat.duration;

    if (start < 0) {
      return;
    }

    setTimeout(() => {
      beatsElem.style.backgroundColor = "";
    }, start * 1000 + 50);

    setTimeout(() => {
      beatsElem.style.backgroundColor = txtColor;
    }, end * 1000);
  });

  bars.forEach((bar, index) => {
    const start = bar.start - progress / 1000;
    const end = start + bar.duration;

    if (start < 0) {
      return;
    }

    setTimeout(() => {
      barsElem.style.backgroundColor = "";
    }, start * 1000 + 50);

    setTimeout(() => {
      barsElem.style.backgroundColor = txtColor;
    }, end * 1000);
  });

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

const colorThief = new ColorThief();
const img = document.querySelector('img');

let txtColor = "white";

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
  analysis(data.analysis, data.track.progress_ms);
}
