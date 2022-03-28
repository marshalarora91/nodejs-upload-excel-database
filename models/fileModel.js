var mongoose  =  require('mongoose');  
   
var excelSchema = new mongoose.Schema({  
    name: {
        type: String,
      },
},{timestamps: true});  
   
module.exports = mongoose.model('files',excelSchema)