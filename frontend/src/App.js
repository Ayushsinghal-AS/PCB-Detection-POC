import "./App.css";
import React, { useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import axios from "axios";
import { Path } from "react-router-dom";
import img from './Result/Results.jpeg'

const App = () => {
  const [src, setSrc] = useState(null); //imgURL for display file image
  const [count, setCount] = useState(1); // count the cropped image
  const [crop, setCrop] = useState({
    x: null,
    y: null,
    width: null,
    height: null,
    unit: '%'
  });
  const [imageFile, setImageFile] = useState(null); // cropped image in File format
  const [output, setOutput] = useState(null); // to display the cropped image
  const [testImage, setTestImage] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [flag, setFlag] = useState(false)
  const [rf, setrf] = useState(false)
  const [faultImage,setFaultImage] = useState(null)
  const cropImgRef = useRef(null);

  const imageFileHandler = async (file) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      setSrc(reader.result);
    };

    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("original", file);
    try {
      const { data, status } = await axios.post(
        "http://localhost:8000/saveoriginalimage",
        formData
      );
      if (status === 200) {

        // alert(data.message);
        setOutput(null);

      } else {
        setOutput(null);
        alert("Please Try Again");
      }
    } catch (error) {
      console.log(error);
      setOutput(null);
      alert("Please Try Again");
    }

  };
  const imageFileHandler2 = async (file) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      setFaultImage(reader.result);
    };
    
    reader.readAsDataURL(file);
  };

  const imageTestHandler = async (file) => {
    const formData = new FormData();
    formData.append("test", file);
    try {
      const { data, status } = await axios.post(
        "http://localhost:8000/uploadTest",
        formData
      );
      if (status === 200) {
        // setCount((e) => e + 1);
        alert(data.message);
        setOutput(null);
        // console.log(data.message);
      } else {
        alert("Please Try Again");
      }
    } catch (error) {
      console.log(error);
      // alert(error.response.data.error);
    }

  };

  //cropped the image @@ get cropped dimension and img File......
  const cropImageNow = () => {
    const canvas = document.createElement("canvas");
    const pixelRatio = window.devicePixelRatio;
    const scaleX = cropImgRef.current.naturalWidth / cropImgRef.current.width;
    const scaleY = cropImgRef.current.naturalHeight / cropImgRef.current.height;
    const ctx = canvas.getContext("2d");

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";
    //draw img acc to cropped Dim........
    ctx.drawImage(
      cropImgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    // Converting to base64
    const base64Image = canvas.toDataURL("image/jpeg");
    setOutput(base64Image);

    canvas.toBlob(
      function (blob) {
        const fileName = ("0" + count).slice(-2);
        var file = new File([blob], `${fileName}.jpeg`, {
          type: "application/octet-stream",
        });
        setImageFile(file);
      },
      "image/jpeg",
      1
    );
  };

  // to hit the backend API for further proccess...........
  const onSendHandler = async () => {
    // cropped image dim....
    const jsonData = {
      TOP_LEFT_X: Math.floor(crop.x),
      TOP_LEFT_Y: Math.floor(crop.y),
      BOTTOM_RIGHT_X: Math.floor(crop.width) + Math.floor(crop.x),
      BOTTOM_RIGHT_Y: Math.floor(crop.height) + Math.floor(crop.y),
      LABEL: count, // number of images
      filename: ("0" + count).slice(-2), // file name  @@ no of count is file name
    };


    try {
      const { data, status } = await axios.post(
        "http://localhost:8000/uploadCrop",
        jsonData
      );
      if (status === 200) {
        const { data, status } = await axios.post(
          "http://localhost:8000/cropimg"

        );


        setCount(e => e + 1)
        alert('cropped image successfully uploaded and processed')
        setOutput(null);
        //     alert(data.message)
        // console.log('hii');
      }

    } catch (error) {
      console.log(error);


      // alert(error.response.data.error);

    }
  };

  const onClickHandler = async () => {
    const { data, status } = await axios.get(
      "http://localhost:8000/drowsiness"

    );
    setrf(true)
    alert(data.message)
    console.log(data);
  };

  const testhandler = () => {
    setResultImage(img)

  };
  
  const clearHandler = async () => {
    try {

      const { data, status } = await axios.get(
        "http://localhost:8000/clear"

      );
      // console.log(data);
      if (data) {
        window.location.reload()
      }

    } catch (err) {
      console.log(err);
    }
  }


  return (
    <>
      <nav class="navbar bg-body-tertiary" style={{padding: 0}}>
        <div class="container-fluid" style={{background:"#348FE2"}}>
        <img
            src="https://spanidea.com/wp-content/uploads/2021/07/spanidea-logo-white.png"
            style={{ height: '8%', width: '18%', padding: "1%" }}
            alt={"SpanIdea"}
          />
        </div>
      </nav>
      
      <label for="images" class="drop-container">
        <span class="drop-title">PCB FAULT ANALYSIS</span>
        <span class="drop-title2" style={{marginTop: '50px'}}>Upload Reference PCB Image</span>
        <input style={{marginLeft: '150px',marginTop: '50px'}}
          type="file"
          onChange={(e) => imageFileHandler(e.target.files[0])}
        />
      </label>
        {src ? (
          <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
            <img ref={cropImgRef} src={src} alt="IMG" />
          </ReactCrop>
        ) : (
          <div></div>
        )}
      
      <br />
      <br />
      <div className="button">
        <button type="button" onClick={cropImageNow} class="btn btn-primary">Crop & Display</button>
      </div>
      
      <div className="croppedImg">
        {output ? <img src={output} alt="img" /> : <div> </div>}
      </div>
      <div className="button">

      {output ? (
          <button type="button" onClick={onSendHandler} class="btn btn-primary"> confirm</button>
        ) : (
          <button type="button" disabled class="btn btn-primary"> confirm </button>
        )}
      </div>

      <br />
      <br />
      <div className="runBut">
        <button type="button" onClick={() => setFlag(true)} class="btn btn-primary"> Test your PCB</button>
      </div>
      
      {flag && <div className="runButton">
      <span class="title3">Upload faulty PCB image</span>
        <input
          type="file"
          onChange={(e) =>{ imageFileHandler2(e.target.files[0]);
            imageTestHandler(e.target.files[0])  }}
        />
        {faultImage && <img  src={faultImage}/>}
        <div style={{display:'flex', justifyContent:'center',marginTop:'15px', gap:'20px'}}>
        <button type="button" onClick={onClickHandler} class="btn btn-primary">Test</button>
        {rf && <button type="button" onClick={testhandler}class="btn btn-primary"> dispaly result</button>}
        </div>
        
      </div>}

      <br ></br>


      <img src={resultImage} />
      <div style={{
          display:'flex',
          justifyContent:'center'}}>
      <button type="button" onClick={clearHandler} class="btn btn-primary"
        
      > Test Again </button>
      </div>
    </>
  );
};
export default App;