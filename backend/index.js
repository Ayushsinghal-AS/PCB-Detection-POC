
const express = require('express')
const multer=require('multer')
const app = express()
const port = 8000
const fs =require('fs')
const {execSync, ChildProcess, exec,spawn}=require('child_process');

const cors=require("cors")
const { json } = require('body-parser')

app.use(cors());

app.use(express.json());

// ....................multer --file save -- folders......................
const cropped = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "cropped/")
  },
  filename: (req, file, cb) => {
    cb(null,  file.originalname)
  },
})


const test = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "test/")
  },
  filename: (req, file, cb) => {
    cb(null,  'test1.jpeg')
  },
})


const original = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "originalImage/")
  },
  filename: (req, file, cb) => {
    cb(null,  'Train.jpeg')
  },
})

//...................------.............................

//save jspn file in the folder for further proccess..........
const uploadJsonFile = async(req,res,next)=>{
  const { TOP_LEFT_X,TOP_LEFT_Y,BOTTOM_RIGHT_X,BOTTOM_RIGHT_Y ,LABEL,filename}=req.body
  console.log(filename);
  // res.send('hii')
  const data = [{
    'TOP_LEFT_X' : TOP_LEFT_X,
    'TOP_LEFT_Y':TOP_LEFT_Y,
    'BOTTOM_RIGHT_X':BOTTOM_RIGHT_X,
    'BOTTOM_RIGHT_Y':BOTTOM_RIGHT_Y,
    'LABEL':LABEL,
   }]
  
  try {
    fs.writeFile("json/01.json", JSON.stringify(req.body), function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
   
      console.log("JSON file has been saved.");
  });


  fs.writeFile(`jsonList/${filename}.json`, JSON.stringify(data), function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
});

    //  fs.writeFileSync("jsonList/"+filename+'.json', JSON.stringify(data))
   res.send('waah')
   
  } catch (error) {
    res.send('no data')
    console.log(error);
  }
   
 
}

//python script for cropped images save......................
const runPythonScriptToSaveCroppedImage = (req,res)=>{
  // console.log('middleware');
  try {
    
  
    var dataToSend;
    
    const python =  spawn('python',['cropedImage.py'])
  python.stdout.on('data', function (data) {

    console.log('Pipe data from python script ...');
    dataToSend = data.toString();
   });

   python.on('close', (code) => {
     console.log(`child process close all stdio with code ${code}`);
     
     console.log("data",dataToSend);
     
     });

     res.send("OKAY")
   
  } catch (error) {
    console.log(error);
    return res.status(400).json({message:"Please Try Again"})
  }
  
}


//save original image in originalImage Folder...........
app.post('/saveoriginalimage',multer({storage:original}).single('original'),(req,res)=>{
  if(!req.file)
    return res.status(422).json({error:"Please select a file to upload"})
  return res.status(200).json({message:"success"})
})



//save testing file in the test folder
app.post('/uploadTest',multer({storage:test}).single('test'),(req,res)=>{
  if(!req.file)
    return res.status(422).json({error:"Please select a file to upload"})
  return res.status(200).json({message:"success"})
})


//save json-- cropped image data and run python script to save cropped image using python opencv ......
app.post('/uploadCrop' ,uploadJsonFile);
// app.post('/cropimg',cors(),runPythonScriptToSaveCroppedImage)
app.post('/cropimg',runPythonScriptToSaveCroppedImage)


//run python script for analyse the crop image to original image..............
app.get('/drowsiness', (req, res) => {

  var dataToSend;
    
  const python =  spawn('python',['Test.py'])
python.stdout.on('data', function (data) {
  console.log('Pipe data from python script ...');
  dataToSend = data.toString();
  console.log("data",dataToSend);
 });

 python.on('close', (code) => {
   console.log(`child process close all stdio with code ${code}`);
   
   console.log("data",dataToSend);
   });
  return res.status(200).json({message:"done"})
})
app.get('/result',async(req,res)=>{
  
   fs.readFile('/home/spanidea/Downloads/backML/result/Results.json',function(err,data){
    if(err){
      res.status(400).json({error:'Something went wrong'})
    }
res.status(200).json({message:JSON.parse(data)})

  });
//  res.writeHead(200,{'content-type':'Results/jpeg'});
//  fs.createReadStream('result/Results.jpeg').pipe(res)

})

app.get('/clear',(req,res)=>{
  var dataToSend;
    
  const python =  spawn('python',['clear.py'])
python.stdout.on('data', function (data) {

  dataToSend = data.toString();
 
 });

 python.on('close', (code) => {
  console.log(code);
   
  
   });
  return res.status(200).json({message:"done"})

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
