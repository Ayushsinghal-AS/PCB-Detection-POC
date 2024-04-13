
const express = require('express')
const multer=require('multer')
const app = express()
const port = 5000
const fs =require('fs')
const {execSync, ChildProcess, exec}=require('child_process')
const cors=require("cors")

app.use(cors({
  origin :  'http://192.168.0.21:3000' || "*"
}));

app.use(express.json());

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
    cb(null,  file.originalname)
  },
})



app.post('/uploadCrop',(req,res)=>{
  
  const { TOP_LEFT_X,TOP_LEFT_Y,BOTTOM_RIGHT_X,BOTTOM_RIGHT_Y ,LABEL,filename}=req.body
  console.log(req.body);
  // if(!req.file || !req.body.TOP_LEFT_X || !req.body.TOP_LEFT_Y || !req.body.BOTTOM_RIGHT_X || !req.body.BOTTOM_RIGHT_Y || !req.body.LABEL || !req.body.filename )
  //   return res.status(422).json({error:"Please provide all the fields"})
  // const content=`{\r\n"TOP_LEFT_X":"`+TOP_LEFT_X+`",\n"TOP_LEFT_Y":"`+TOP_LEFT_Y+`",\n"BOTTOM_RIGHT_X":"`+BOTTOM_RIGHT_X+`",\n"BOTTOM_RIGHT_Y":"`+BOTTOM_RIGHT_Y+`",\n"LABEL":"`+LABEL+`"\n}`
  // fs.writeFile("json/"+filename+'.json', content, (err)=> {
  //   if (err) 
  //     return res.status(500).json({error:"Internal server error"})
    
  //   return res.status(200).json({message:"success"})

  // });  
 
})

app.post('/uploadTest',multer({storage:test}).single('file'),(req,res)=>{
  if(!req.file)
    return res.status(422).json({error:"Please select a file to upload"})
  return res.status(200).json({message:"success"})
})


///home/spanidea/Documents/Trash/backend/tests/

app.get('/drowsiness', (req, res) => {
    exec("conda run -n drzs python3 hello.py", {cwd: '/home/spanidea/Documents/Trash/backend/'}) 
    return res.status(200).json({message:"done"})
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
