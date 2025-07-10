const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const TaskSchema = require('./../Models/TaskSchema');
const Apifeatures = require('./../Utils/ApiFeatures');

exports.DisplayTask = AsyncErrorHandler(async(req,res)=>{
    const features= new Apifeatures(TaskSchema.find(),req.query)
                                .filter()
                                .sort()
                                .limitFields()
                                .paginate()

    const Task = await features.query;
    res.status(200).json({
        status:'success',
        data:Task
    })

})