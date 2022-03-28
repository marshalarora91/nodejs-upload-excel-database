const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var excelSchema = new Schema({  
    username: {
        type: String,
      },
    email: {
        type: String,
    },
    status: {
        type: String,
    },
    fileId:  {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'files'
    }
},{timestamps: true});  
   
module.exports = mongoose.model('users',excelSchema)