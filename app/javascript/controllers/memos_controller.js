import { Controller } from "@hotwired/stimulus"
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import TimelinePlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/timeline.esm.js'

let previousSample;
let currentSample;
let playPauseStatObj = new Object();
let waveForms = {};
let memoUpdateOrCreateModalWaveform;
let samplePlayTriangle;
let samplePauseBars;
let memoToDestroy;


export default class extends Controller {

  waveForms = {};
  
  connect() {
    console.log("memos controller")

    if (document.getElementsByClassName('as-waveform')[0].dataset.firstLoad == "true") {
      this.setWaveforms();
    }
    document.getElementsByClassName('as-waveform')[0].dataset.firstLoad = "false"
  }

  setWaveforms() {
    const totalSamplesN = document.getElementsByClassName('as-waveform').length;
    // Setting play/pause status, and wavesurfer wavveforms for all audio samples
    for (let i = 0; i < totalSamplesN; i++) {
      let item = document.getElementsByClassName('as-waveform')[i];
      playPauseStatObj[`${item.dataset.sample_name}`] = 0;
      this.makeWsWaveform(item);
    }
    currentSample = ``;
    previousSample = `${document.getElementsByClassName('as-waveform')[0].dataset.sample_name}`;
    this.oldSampleName = `${document.getElementsByClassName('as-waveform')[0].dataset.sample_name}`;
    console.log(waveForms);
  }

  makeWsWaveform(item) {
    const audiosource = item.dataset.audiosource;
    waveForms[item.dataset.sample_name] = WaveSurfer.create({
      container: `#audio${item.dataset.sample_name}`,
      waveColor: '#6b7574',
      progressColor: 'black',
      height: 60,
      cursorWidth: 0,
      hideScrollbar: true,
      barWidth: 2,
      splitChannels: false,
    });
    waveForms[item.dataset.sample_name].load(`${audiosource}`);

    waveForms[item.dataset.sample_name].on('ready', function() {
      const duration = waveForms[item.dataset.sample_name].getDuration();
      item.dataset.duration = duration;
    })

    waveForms[item.dataset.sample_name].registerPlugin(TimelinePlugin.create())

    waveForms[item.dataset.sample_name].on('interaction', function () {
        if (this.isPlaying()) {
            this.pause();
        }
    });

     // Play on click
    waveForms[item.dataset.sample_name].on('interaction', () => {
      waveForms[item.dataset.sample_name].play()
    })

    // Rewind to the beginning on finished playing
    waveForms[item.dataset.sample_name].on('finish', () => {
      waveForms[item.dataset.sample_name].setTime(0)
    })

    waveForms[item.dataset.sample_name].on('seek', function (progress) {
      console.log(`Waveform clicked for ${sampleName} at position: ${progress}`);
    });

  }

  playOrPauseAudio(event) { 
    console.log("playOrPauseAudio");

    let sampleName = `${event.target.dataset.audiofilekey}`
    currentSample = sampleName;

    if ((previousSample != currentSample && playPauseStatObj[currentSample] == 0) || (previousSample != currentSample && playPauseStatObj[previousSample] == 1) || (previousSample == currentSample && playPauseStatObj[currentSample] == 0)) {
        if (previousSample != currentSample && playPauseStatObj[previousSample] == 1) {
        console.log("........................New (Interrupting) Audio Item Src Loaded........................")
        waveForms[this.oldSampleName].stop();
        playPauseStatObj[previousSample] = 0;

        //Play/Pause Icon switch
        samplePlayTriangle = document.getElementById("audio".concat(this.oldSampleName, "_tri"))
        samplePauseBars = document.getElementById("audio".concat(this.oldSampleName, "_bar"))
        samplePlayTriangle.style.display = "block";
        samplePauseBars.style.display = "none";
        }
        console.log("........................Play New Audio Item or Play from Paused...........memoUpdateOrCreateModalWaveform.............");
        waveForms[sampleName].play();
        playPauseStatObj[currentSample] = 1;
        previousSample = currentSample;
        console.log(playPauseStatObj);
        console.log(previousSample);

        //Play/Pause Icon switch
        samplePlayTriangle = document.getElementById("audio".concat(sampleName, "_tri"))
        samplePauseBars = document.getElementById("audio".concat(sampleName, "_bar"))
        samplePlayTriangle.style.display = "none";
        samplePauseBars.style.display = "block";
        this.oldSampleName = sampleName;
    } else if (previousSample == currentSample && playPauseStatObj[previousSample] == 1) {
        //Pause currentSample audio
        console.log("........................Pause Audio Item........................");
        waveForms[sampleName].pause();
        playPauseStatObj[currentSample] = 0;
        this.oldSampleName = sampleName;

        //Play/Pause Icon switch
        samplePlayTriangle = document.getElementById("audio".concat(sampleName, "_tri"))
        samplePauseBars = document.getElementById("audio".concat(sampleName, "_bar"))
        samplePlayTriangle.style.display = "block";
        samplePauseBars.style.display = "none";
    }
    //Audio on end process
    waveForms[sampleName].on('finish', function () {
        console.log("........................Audio Ended........................");
        waveForms[sampleName].stop();
        console.log(playPauseStatObj);
        console.log(previousSample);
        playPauseStatObj[previousSample] = 0;

        //Play/Pause Icon switch
        samplePlayTriangle = document.getElementById("audio".concat(sampleName, "_tri"))
        samplePauseBars = document.getElementById("audio".concat(sampleName, "_bar"))
        samplePlayTriangle.style.display = "block";
        samplePauseBars.style.display = "none";
    });
  }

  showNewMemoModal() {
    console.log("memos showNewMemoModal");

    waveForms[previousSample].stop();
    playPauseStatObj[previousSample] = 0;

    //Play/Pause Icon switch
    samplePlayTriangle = document.getElementById("audio".concat(this.oldSampleName, "_tri"))
    samplePauseBars = document.getElementById("audio".concat(this.oldSampleName, "_bar"))
    samplePlayTriangle.style.display = "block";
    samplePauseBars.style.display = "none";
  }

  showDestroyMemoModal() {
    console.log("showDestroyMemoModal");

    document.body.style.overflowY = 'hidden';
    document.querySelector('#ui-underlay').style.display = 'block';
    document.querySelector('#modalcontainer').classList.add('show-modal-container');
    document.querySelector('#destroymemomodal').classList.add('show-modal');
  }

  closeDestroyMemoModal() {
    console.log("closeDestroyMemoModal");
    
    memoUpdateOrCreateModalWaveform.stop();
    document.body.style.overflowY = 'visible';
    document.querySelector('#ui-underlay').style.display = 'none';
    document.querySelector('#modalcontainer').classList.remove('show-modal-container');
    document.querySelector('#destroymemomodal').classList.remove('show-modal');
  }

  stageMemoDestroy(e) {
    console.log(memoToDestroy);
    memoToDestroy = e.target.dataset.memoId
  }

  submitMemoDestroy() {
    console.log("submitMemoDestroy");

    fetch(`/memos/${memoToDestroy}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector("[name='csrf-token']").content
      }
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log("success")
      location.reload();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  bookmarkMemo(e) {
    console.log("bookmarkMemo");
    console.log(e.target);
    console.log(e.target.dataset.memoId);

    document.querySelector(`#bookmark-memo-${e.target.dataset.memoId}`).classList.toggle("unbookmarked");
    document.querySelector(`#bookmark-memo-${e.target.dataset.memoId}`).classList.toggle("bookmarked");

    

    fetch(`/memos/${e.target.dataset.memoId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector("[name='csrf-token']").content,
      },
      body: JSON.stringify({
        memo: {
          bookmarked: document.querySelector(`#bookmark-memo-${e.target.dataset.memoId}`).classList.contains('bookmarked')
        }
      }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log("success")
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  }

}
