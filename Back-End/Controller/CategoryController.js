const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Apifeatures = require('./../Utils/ApiFeatures');
const category = require('./../Models/inventoryCategorySchema')


exports.createCategory = AsyncErrorHandler(async (req, res) => {
  const { name, description } = req.body;

  console.log(req.body)

  if (!name) {
    return res.status(400).json({ 
      status: "fail",
      message: "Category name is required" 
    });
  }

  const newCategory = await category.create({ name, description });

  res.status(201).json({
    status: "success",
    data: newCategory,
  });
});


exports.Displaycategory = AsyncErrorHandler(async(req,res)=>{
    const features= new Apifeatures(category.find(),req.query)
                                .filter()
                                .sort()
                                .limitFields()
                                .paginate()

    const categoryed = await features.query;


    res.status(200).json({
        status:'success',
        data:categoryed
    })

})


exports.Updatecategory =AsyncErrorHandler(async (req,res,next) =>{
    const updatecategory=await category.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
            updatecategory
        
     }); 
  })

  exports.deletecategory = AsyncErrorHandler(async(req,res,next)=>{

      const hascategory = await category.exists({ category: req.params.id });
    
      if (hascategory) {
        return res.status(400).json({
          status: "fail",
          message: "Cannot delete category: there are existing related records.",
        });
      }
    await category.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        data:
            null
        
     });
  })