import { Controller } from "@hotwired/stimulus";

let playPauseStatObj = new Object();

export default class extends Controller {
  waveForms = {};
  blob;

  connect() {

    // Set up basic variables for app
    const recordButton = document.querySelector("#record-button");
    const stopButton = document.querySelector("#stop-button");
    const stopOrRecordButton = document.querySelector(".stop-or-record-button");
    const soundClips = document.querySelector(".recording-output");
    const canvas = document.querySelector(".visualizer");
    const mainSection = document.querySelector(".main-controls");
    let recordStatus = "stopped";

    // Disable stop button while not recording
    stop.disabled = true;

    // Visualiser setup - create web audio api context and canvas
    let audioCtx;
    const canvasCtx = canvas.getContext("2d");

    // Main block for doing the audio recording
    if (navigator.mediaDevices.getUserMedia) {

      const constraints = { audio: true };
      let chunks = [];

      let onSuccess = function (stream) {
        document.querySelector("#microphone-status").innerHTML =
          "microphone active";
        document
          .querySelector("#microphone-status")
          .classList.remove("inactive");
        document.querySelector("#microphone-status").classList.add("active");

        const mediaRecorder = new MediaRecorder(stream);

        visualize(stream);

        recordButton.onclick = () => startRecording(mediaRecorder);
        stopButton.onclick = () => stopRecording(mediaRecorder);
        stopOrRecordButton.onclick = function () {
          if (recordStatus == "stopped") {
            startRecording(mediaRecorder);
          } else {
            stopRecording(mediaRecorder);
          }
        };

        mediaRecorder.onstop = function (e) {

          soundClips.innerHTML = "";
          const audio = document.createElement("audio");
          this.blob = new Blob(chunks, { type: mediaRecorder.mimeType });

          chunks = [];
          const audioURL = window.URL.createObjectURL(this.blob);
          audio.src = audioURL;

          let file = new File([this.blob], "voicemail.webm", {
            type: "audio/webm",
            lastModified: new Date().getTime(),
          });
          let container = new DataTransfer();
          container.items.add(file);
          document.querySelector("#memo-form-audiofile-input").files =
            container.files;

          const audioWaveForm = `
            <div class='w-100' id="audio-player"
              data-audiosource="${audioURL}"
              data-audiofilekey="voicemailrecording">
              <div class='flex flex-row relative items-center mt-6'>

                <!-- audio play/pause -->
                <div class='as-play-button mt-1' data-controller="newwaveform" data-action="click->newwaveform#playOrPauseAudio">
                  <svg class='as-play-button__svg' viewBox='0 0 300 300'
                    data-audiosource="${audioURL}"
                    data-audiofilekey="voicemailrecording">
                    <g transform='translate(5, 0)'>
                      <path id="audiovoicemailrecording_tri" class='as-play-button__triangle'
                        data-audiosource="${audioURL}"
                        data-audiofilekey="voicemailrecording"
                        d='m 95.514374,224.65227 c -0.05649,-49.76848 -0.112973,-99.53696 -0.16946,-149.30544 43.129016,24.83532 86.258026,49.67064 129.387036,74.50596 -43.07252,24.93316 -86.14505,49.86632 -129.217576,74.79948 z'/>
                    </g>
                    <g class='as-play-button__pause-bars' id='audiovoicemailrecording_bar' transform='translate(50, 45)'>
                      <rect
                        id="newOrUpdatePlayPauseButoonBarOne"
                        data-audiosource="${audioURL}"
                        data-audiofilekey="voicemailrecording" x='115' y='26' ry='8' width='47' height='150' class='AudBtn-PauseRectL' />
                      <rect
                        id="newOrUpdatePlayPauseButoonBarTwo"
                        data-audiosource="${audioURL}"
                        data-audiofilekey="voicemailrecording" x='35' y='26' ry='8' width='47' height='150' class='AudBtn-PauseRectR' />
                    </g>
                  </svg>
                </div>

                <!-- waveform -->
                <div class='new-as-waveform mb-1 w-full h-auto'
                  data-first-load="true"
                  data-sample_name="voicemailrecording"
                  data-audiosource="${audioURL}"
                  id='audiovoicemailrecording'
                  >
                </div>
              </div>
            </div>
          `;
          soundClips.insertAdjacentHTML("beforeend", audioWaveForm);
        };

        mediaRecorder.ondataavailable = function (e) {
          chunks.push(e.data);
        };
      };

      let onError = function (err) {
      };

      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    } else {
      // console.log("MediaDevices.getUserMedia() not supported on your browser!");
    }

    function startRecording(mediaRecorder) {
      recordStatus = "recording";
      mediaRecorder.start();

      document
        .querySelector("#initial-recording-output-overlay")
        .classList.add("overlayed");
      document
        .querySelector("#initial-recording-output-overlay")
        .classList.remove("reveal");

      document.querySelector("#microphone-status").innerHTML = "recording...";
      document.querySelector("#microphone-status").classList.remove("active");
      document.querySelector("#microphone-status").classList.add("recording");

      stopButton.disabled = false;
      recordButton.disabled = true;

      stopButton.classList.remove("button-inactive");
      stopButton.classList.add("button-stoprecord");

      recordButton.classList.remove("button-record");
      recordButton.classList.add("button-inactive");
      recordButton.innerHTML = "Recording";
    }

    function stopRecording(mediaRecorder) {
      recordStatus = "stopped";
      mediaRecorder.stop();

      document
        .querySelector("#initial-recording-output-overlay")
        .classList.remove("overlayed");
      document
        .querySelector("#initial-recording-output-overlay")
        .classList.add("reveal");
      //
      soundClips.innerHTML = "";

      document.querySelector("#microphone-status").innerHTML =
        "microphone active";
      document
        .querySelector("#microphone-status")
        .classList.remove("recording");
      document.querySelector("#microphone-status").classList.add("active");

      stopButton.disabled = true;
      recordButton.disabled = false;

      stopButton.classList.remove("button-stoprecord");
      stopButton.classList.add("button-inactive");

      recordButton.innerHTML = "Record";
      recordButton.classList.remove("button-inactive");
      recordButton.classList.add("button-record");
    }

    function visualize(stream) {
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }

      const source = audioCtx.createMediaStreamSource(stream);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      draw();

      function draw() {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        const centerX = WIDTH / 2;
        const centerY = HEIGHT / 2;
        const baseRadius = 0.75 * Math.min(centerX, centerY);

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = "rgb(255, 255, 255)";
        canvasCtx.strokeStyle = "rgb(0, 0, 0)";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 4;
        canvasCtx.strokeStyle = "#fd9d9b";

        canvasCtx.beginPath();

        let angleStep = (2 * Math.PI) / bufferLength;
        let angle = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v = dataArray[i] / 128.0;
          let r = (0.5 + v * 0.25) * Math.min(centerX, centerY);

          let x = centerX + r * Math.cos(angle);
          let y = centerY + r * Math.sin(angle);

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          angle += angleStep;
        }

        canvasCtx.closePath();
        canvasCtx.stroke();
      }

      const myFile = new File(["Hello World!"], "myFile.txt", {
        type: "text/plain",
        lastModified: new Date(),
      });
    }

    window.onresize = function () {
      canvas.width = mainSection.offsetWidth;
    };
  }

  submitAudio(e) {

    e.preventDefault();

    let formData = new FormData();
    let memoFormNameInputValue = document.querySelector(
      "#memo-form-name-input"
    ).value;
    const memoFormNotesInputValue = document.querySelector(
      "#memo-form-notes-input"
    ).value;
    if (memoFormNameInputValue == "" || memoFormNameInputValue == null) {
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];
      memoFormNameInputValue = formattedDate;
    }

    formData.append("memo[name]", memoFormNameInputValue);
    formData.append("memo[notes]", memoFormNotesInputValue);

    let submitTypeIsUpdate = false;
    if (e.target.dataset.memoId == "undefined") {
      submitTypeIsUpdate = false;
    } else {
      submitTypeIsUpdate = true;
      const bookmarked =
        document.querySelector(`#bookmark-memo-${e.target.dataset.memoId}`)
          .className == "bookmarked"
          ? true
          : false;
      formData.append("memo[bookmarked]", bookmarked);
    }

    // set spinner
    const memoFormAudioFileInput = document.querySelector(
      "#memo-form-audiofile-input"
    ).files;
    if (memoFormAudioFileInput.length < 1) {
      // no audio recorded
    } else {
      formData.append("memo[audio_file]", memoFormAudioFileInput[0]);
    }

    document.querySelector("#memo-submit-button").disabled = true;
    document.querySelector("#memo-submit-button-text").innerHTML = "Saving...";
    document.querySelector("#spinner").classList.remove("hidden");

    if (submitTypeIsUpdate == true) {
      fetch(`/memos/${e.target.dataset.memoId}`, {
        method: "PATCH",
        headers: {
          "X-CSRF-Token": document.querySelector("[name='csrf-token']").content,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          document.querySelector("#memo-submit-button-text").innerHTML =
            "Saved";
          document.querySelector(".spinner").classList.add("hidden");

          setTimeout(function () {
            location.reload();
          }, 2000);
        })
        .catch((error) => {
          console.error("Error:", error);
          document.querySelector("#memo-submit-button-text").innerHTML =
            "Error";
        });
    } else {
      fetch(`/memos`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": document.querySelector("[name='csrf-token']").content,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          document.querySelector("#memo-submit-button-text").innerHTML =
            "Saved";
          document.querySelector(".spinner").classList.add("hidden");

          setTimeout(function () {
            location.reload();
          }, 2000);
        })
        .catch((error) => {
          console.error("Error:", error);
          document.querySelector("#memo-submit-button-text").innerHTML =
            "Error";
        });
    }
  }
}
