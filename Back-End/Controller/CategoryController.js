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


exports.Displaycategory = AsyncErrorHandler(async (req, res) => {
  const { limit = 10, page = 1, search = "" } = req.query;

  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const skip = (parsedPage - 1) * parsedLimit;

  const matchStage = {};

  // Optional search functionality (by name or description)
  if (search.trim()) {
    const searchTerms = search.trim().split(/\s+/);
    matchStage.$and = searchTerms.map((term) => ({
      $or: [
        { name: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
      ],
    }));
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: parsedLimit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const results = await category.aggregate(pipeline);
  const data = results[0]?.data || [];
  const totalCategories = results[0]?.totalCount[0]?.count || 0;

  res.status(200).json({
    status: "success",
    data,
    totalCategories,
    totalPages: Math.ceil(totalCategories / parsedLimit),
    currentPage: parsedPage,
  });
});


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