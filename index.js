function log(text, ...textExtra) {
  console.log(text, ...textExtra);
  document.getElementById("log").innerHTML =
    new Date().toLocaleTimeString() + " " + text;
}

(async () => {
  try {
    const fileInput = document.getElementById("userUpload");
    const result = document.getElementById("result");
    const image = document.getElementById("tesseractImage");
    const imageSelectionXY = {};
    let blob;
  
    const worker = Tesseract.createWorker({
      logger: m => log(m.status)
    });
    
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  
    fileInput.addEventListener("change", async event => {
      blob = URL.createObjectURL(
        document.getElementById("userUpload").files[0]
      );
  
      image.src = blob;
      
      const { data: { text } } = await worker.recognize(blob);

      result.innerHTML = text;

      // Hermes
      if (/P\d{7}/.exec(text)) {
        const trackingNumber = /P\d{7}/.exec(text);

        const [urn] = await fetch(`https://api.hermesworld.co.uk/enterprise-tracking-api/v1/parcels/search/${trackingNumber}`, {
          headers: {
            apiKey: 'R6xkX4kqK4U7UxqTNraxmXrnPi8cFPZ6',
          }
        }).then(response => response.json())

        location.href = `https://new.myhermes.co.uk/track.html#/parcel/${urn.split(':')[5]}/details`
      } else if(/Barcode Number: (.+)/.exec(text)) {
        // Royal mail
        const trackingNumber = /Barcode Number: (.+)/.exec(text)[1];
        location.href = `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;
      } else {
        log('No delivery company match');
      }
    });
  
  
    // await worker.terminate();
  
    // image.addEventListener("touchstart", event => {
    //   log("start", event.touches[0].clientX, event.touches[0].clientY);
    //   imageSelectionXY.top = Math.round(event.touches[0].clientY);
    //   imageSelectionXY.left = Math.round(event.touches[0].clientX);
    // });
  
    // image.addEventListener("touchend", async event => {
    //   log(
    //     "end",
    //     event.changedTouches[0].clientX,
    //     event.changedTouches[0].clientY
    //   );
    //   imageSelectionXY.width =
    //     Math.round(event.changedTouches[0].clientX - imageSelectionXY.left);
    //   imageSelectionXY.height =
    //     Math.round(event.changedTouches[0].clientY - imageSelectionXY.top);
  
    //   log(JSON.stringify(imageSelectionXY));
    // });
  } catch (error) {
    alert(error.message);
  }
})();
