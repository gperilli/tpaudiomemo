import { Controller } from "@hotwired/stimulus"
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js'
import TimelinePlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/timeline.esm.js'

let previousSample;
let currentSample;
let playPauseStatObj = new Object();
let waveform;
let samplePlayTriangle;
let samplePauseBars;
let memoUpdateOrSaveCurrentAudioKey;
let currentMemo = 0;

export default class extends Controller {

  waveForms = {};
  connect() {
    console.log("new waveform controller")

    if (document.getElementsByClassName('new-as-waveform')[0].dataset.firstLoad == "true") {
      this.setWaveforms();
    }
    document.getElementsByClassName('new-as-waveform')[0].dataset.firstLoad = "false"
  }

  setWaveforms() {
    console.log("setWaveforms");
    const totalSamplesN = document.getElementsByClassName('new-as-waveform').length;
    // Setting play/pause status, and wavesurfer wavveforms for all audio samples
    for (let i = 0; i < totalSamplesN; i++) {
      let item = document.getElementsByClassName('new-as-waveform')[i];
      playPauseStatObj[`${item.dataset.sample_name}`] = 0;
      this.makeWsWaveform(item);
    }
    currentSample = ``;
    previousSample = `${document.getElementsByClassName('new-as-waveform')[0].dataset.sample_name}`;
  }

  makeWsWaveform(item) {
    console.log("makeWsWaveform for new memo modal");
    const audiosource = item.dataset.audiosource;
    console.log(audiosource);
    waveform = WaveSurfer.create({
      container: `#audiovoicemailrecording`,
      waveColor: '#6b7574',
      progressColor: 'black',
      height: 60,
      cursorWidth: 0,
      hideScrollbar: true,
      barWidth: 2,
      splitChannels: false,
    });    
    console.log('waveform');
    console.log(waveform);
    waveform.load(`${audiosource}`);

    waveform.on('ready', function() {
      const duration = waveform.getDuration();
      item.dataset.duration = duration;
    })

    waveform.registerPlugin(TimelinePlugin.create())

    waveform.on('interaction', function () {
        if (this.isPlaying()) {
            this.pause();
        }
    });

    // Rewind to the beginning on finished playing
    waveform.on('finish', () => {
      waveform.setTime(0)
    })

    waveform.on('seek', function (progress) {
        console.log(`Waveform clicked for ${sampleName} at position: ${progress}`);
    });
  }

  playOrPauseAudio() { 
    console.log("playOrPauseAudio");
      
    samplePlayTriangle = document.getElementById("audiovoicemailrecording_tri");
    samplePauseBars = document.getElementById("audiovoicemailrecording_bar");

    if (waveform.isPlaying()) {
      console.log('Audio is playing');

      waveform.pause();
      
      samplePlayTriangle.style.display = "block";
      samplePauseBars.style.display = "none";
    } else {
      console.log('Audio is not playing');

      waveform.play();

      samplePlayTriangle.style.display = "none";
      samplePauseBars.style.display = "block";
    }

    waveform.on('finish', function () {
      console.log("........................Audio Ended........................");
      waveform.stop();
      samplePlayTriangle.style.display = "block";
      samplePauseBars.style.display = "none";
    });
  }

  showNewMemoModal(e) {
    console.log("waveform showNewMemoModal");
    console.log(e.target.dataset.memoId);

    currentMemo = e.target.dataset.memoId;
    console.log(currentMemo);
    document.querySelector('#memo-submit-button').dataset.memoId = e.target.dataset.memoId;

    const updateOrNew = e.target.dataset.updateOrNew;
    console.log(e.target);
    console.log(e.target.dataset.updateOrNew);
    console.log(updateOrNew);
    document.querySelector('#update-or-new-modal-title').innerHTML = updateOrNew == 'new' ? 'Take Memo' : 'Update Memo';

    if (updateOrNew == "update") {
      console.log(e.target.dataset.memoId);
      document.querySelector('#memo-form-name-input').value = document.querySelector(`#memo-name-${e.target.dataset.memoId}`).innerHTML;
      document.querySelector('#memo-form-notes-input').value = document.querySelector(`#memo-notes-${e.target.dataset.memoId}`).innerHTML;
    } else {
      document.querySelector('#memo-form-name-input').value = '';
      document.querySelector('#memo-form-notes-input').value = '';
    }

    // document.body.style.overflowY = 'hidden';
    
    document.querySelector('#ui-underlay').style.display = 'block';
    document.querySelector('#modalcontainer').classList.add('show-modal-container');
    document.querySelector('#newmemomodal').classList.add('show-modal');

    let audiosource;
    
    let waveformContainer = document.querySelector('#audiovoicemailrecording');
    if (updateOrNew == "update") {

      memoUpdateOrSaveCurrentAudioKey = e.target.dataset.audioFileKey;
      waveformContainer.dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/${memoUpdateOrSaveCurrentAudioKey}`
      waveformContainer.dataset.audiofilekey = memoUpdateOrSaveCurrentAudioKey;
      waveformContainer.dataset.sample_name = memoUpdateOrSaveCurrentAudioKey;
      
      document.querySelectorAll('.as-play-button__svg')[1].dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/${memoUpdateOrSaveCurrentAudioKey}`
      document.querySelectorAll('.as-play-button__svg')[1].dataset.audiofilekey = memoUpdateOrSaveCurrentAudioKey;
      console.log(document.querySelector('.as-play-button__svg'));

      document.querySelector('#newOrUpdatePlayPauseButoonBarOne').dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/${memoUpdateOrSaveCurrentAudioKey}`
      document.querySelector('#newOrUpdatePlayPauseButoonBarTwo').dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/${memoUpdateOrSaveCurrentAudioKey}`
      document.querySelector('#newOrUpdatePlayPauseButoonBarOne').dataset.audiofilekey = memoUpdateOrSaveCurrentAudioKey;
      document.querySelector('#newOrUpdatePlayPauseButoonBarTwo').dataset.audiofilekey = memoUpdateOrSaveCurrentAudioKey;

      document.querySelector('#audiovoicemailrecording_tri').dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/${memoUpdateOrSaveCurrentAudioKey}`;
      document.querySelector('#audiovoicemailrecording_tri').dataset.audiofilekey = memoUpdateOrSaveCurrentAudioKey;

      document.querySelector('#audio-player').dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/${memoUpdateOrSaveCurrentAudioKey}`
      document.querySelector('#audio-player').dataset.audiofilekey = memoUpdateOrSaveCurrentAudioKey;

      document.querySelector('#initial-recording-output-overlay').style.display = 'none';
    } else {
      memoUpdateOrSaveCurrentAudioKey = 'kkx6uxfz2qv9ji1oktjg5f0i61hm';
      waveformContainer.dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/kkx6uxfz2qv9ji1oktjg5f0i61hm`
      waveformContainer.dataset.audiofilekey = memoUpdateOrSaveCurrentAudioKey;
      waveformContainer.dataset.sample_name = memoUpdateOrSaveCurrentAudioKey;
      
      document.querySelector('#newOrUpdatePlayPauseButoonBarOne').dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/kkx6uxfz2qv9ji1oktjg5f0i61hm`
      document.querySelector('#newOrUpdatePlayPauseButoonBarTwo').dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/kkx6uxfz2qv9ji1oktjg5f0i61hm`
      document.querySelector('#newOrUpdatePlayPauseButoonBarOne').dataset.audiofilekey = memoUpdateOrSaveCurrentAudioKey;
      document.querySelector('#newOrUpdatePlayPauseButoonBarOne').dataset.audiofilekey = memoUpdateOrSaveCurrentAudioKey;
      
      document.querySelector('#audiovoicemailrecording_tri').dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/kkx6uxfz2qv9ji1oktjg5f0i61hm`;
      document.querySelector('#audiovoicemailrecording_tri').dataset.audiofilekey = `kkx6uxfz2qv9ji1oktjg5f0i61hm`;
      
      document.querySelector('#audio-player').dataset.audiosource = `https://res.cloudinary.com/gperilli/video/upload/v1/development/kkx6uxfz2qv9ji1oktjg5f0i61hm`
      document.querySelector('#audio-player').dataset.audiofilekey = memoUpdateOrSaveCurrentAudioKey;

      document.querySelector('#initial-recording-output-overlay').style.display = 'block';
    }
    audiosource = waveformContainer.dataset.audiosource;

    waveformContainer.innerHTML = '';
    waveform = WaveSurfer.create({
      container: `#audiovoicemailrecording`,
      waveColor: '#6b7574',
      progressColor: 'black',
      height: 60,
      cursorWidth: 0,
      hideScrollbar: true,
      barWidth: 2,
      splitChannels: false,
    });
    waveform.load(`${audiosource}`);
    console.log(waveform);

    waveform.on('ready', function() {
      const duration = waveform.getDuration();
      waveformContainer.dataset.duration = duration;
    })

    waveform.registerPlugin(TimelinePlugin.create())

    waveform.on('interaction', function () {
      if (this.isPlaying()) {
          this.pause();
      }
    })

    // Rewind to the beginning on finished playing
    waveform.on('finish', () => {
      waveform.setTime(0)
    })

    waveform.on('seek', function (progress) {
        console.log(`Waveform clicked for ${sampleName} at position: ${progress}`);
    });
    

  }

  closeNewMemoModal() {
    console.log("closeNewMemoModal");

    waveform.stop();

    document.body.style.overflowY = 'visible';
    document.querySelector('#ui-underlay').style.display = 'none';
    document.querySelector('#modalcontainer').classList.remove('show-modal-container');
    document.querySelector('#newmemomodal').classList.remove('show-modal');

    samplePlayTriangle = document.getElementById("audiovoicemailrecording_tri")
    samplePauseBars = document.getElementById("audiovoicemailrecording_bar")
    samplePlayTriangle.style.display = "block";
    samplePauseBars.style.display = "none";
  }
}
