var express     = require('express');  
var fs     = require('fs');  
var mongoose    = require('mongoose');  
var multer      = require('multer');  
var path        = require('path');  
var userModel    = require('./models/userModel');  
var fileModel    = require('./models/fileModel');  
var bodyParser  = require('body-parser');  
var xlsx2json = require('xlsx2json')


var storage = multer.diskStorage({  
  destination:(req,file,cb)=>{  
    cb(null,'./public/uploads');  
  },  
  filename:(req,file,cb)=>{  
    cb(null,new Date().toISOString() + '-' + file.originalname);  
  }  
});  
var uploads = multer({storage:storage});  
//connect to db  
mongoose.connect('mongodb://localhost:27017/exceldemo',{useNewUrlParser:true})  
.then(()=>console.log('connected to db'))  
.catch((err)=>console.log(err))  
//init app  
var app = express();  
//set the template engine  
app.set('view engine', 'ejs');
app.set('views', 'views'); 
//fetch data from the request  
app.use(bodyParser.urlencoded({extended:false}));  
//static folder  
app.use(express.static(path.resolve(__dirname,'public')));  
//route for Home page
app.get('/', (req, res) => {
  res.render('index');
});
// Upload excel file and import to mongodb
app.post('/uploadfile', uploads.single("uploadfile"), (req, res) =>{
  importExcelData2MongoDB(__dirname + '/public/uploads/' + req.file.filename,req.file.filename);

   res.redirect('/users/list');
});

app.get('/users/list', (req, res) => {
  userModel.find()
    .populate('fileId')
    .then(users => {
      res.render('user_list', {
        users: users
      });
    })
    .catch(err => {
      console.log(err)
    });
});

app.get('/files/list', (req, res) => {
  fileModel.find()
    .then(files => {
      res.render('files_list', {
        files: files
      });
    })
    .catch(err => {
      console.log(err)
    });
});

app.get('/file/delete/:id', (req, res) => {

  const fileIdParam = req.params.id;

  fileModel.findByIdAndDelete(fileIdParam)
  .then(deletedFile=>{

    fs.unlinkSync(__dirname + '/public/uploads/' + deletedFile.name);
    userModel.deleteMany({ fileId: fileIdParam })
      .exec()
      .then(() => {
        return res.redirect('/files/list');
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          error: err,
        });
      });
  }).catch(err=>{
    console.log(err);
  })
 
});


function importExcelData2MongoDB(filePath,fileName){
  console.log(filePath);

  const file = new fileModel({
    name: fileName
  });

  file.save();

  xlsx2json(filePath,
  {
    dataStartingRow: 2,
    mapping: {
        'username': 'A',
        'email': 'B',
        'status': 'C',
    }
  }).then(jsonArray => { 

    jsonArray[0].forEach(userRecord => {
      if(userRecord.username)
      {
        const user = new userModel({
          username: userRecord.username,
          email: userRecord.email,
          status: userRecord.status,
          fileId: file._id,
        });
        user.save();
      }
    });
    
    // fs.unlinkSync(filePath);
    return;
  });

}
//assign port  
var port = process.env.PORT || 3000;  
app.listen(port,()=>console.log('server run at port '+port));  