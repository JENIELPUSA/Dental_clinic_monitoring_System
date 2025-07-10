const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Profile = require('./../Models/ProfillingSchema');
const Apifeatures = require('./../Utils/ApiFeatures');

exports.createProfile=AsyncErrorHandler(async(req,res) => {
    const branded = await Profile.create(req.body);
    res.status(201).json({
        status:'success',
        data:
            branded
    })

})

exports.DisplayProfile = AsyncErrorHandler(async (req, res) => {
  const profileData = await Profile.aggregate([
    // Join with Newborn collection
    {
      $lookup: {
        from: 'newborns',
        localField: 'newborn_id',
        foreignField: '_id',
        as: 'newborn'
      }
    },
    { $unwind: '$newborn' },

    // Join with User collection (Mother Info)
    {
      $lookup: {
        from: 'users',
        localField: 'newborn.motherName', // Match to motherName reference in Newborn schema
        foreignField: '_id',
        as: 'mother'
      }
    },
    { $unwind: { path: '$mother', preserveNullAndEmptyArrays: true } },

    // Join with VaccinationRecord based on newborn._id
    {
      $lookup: {
        from: 'vaccinationrecords',
        localField: 'newborn._id',
        foreignField: 'newborn',
        as: 'vaccinationRecords'
      }
    },

    // Join with vaccines collection for each vaccine reference
    {
      $lookup: {
        from: 'vaccines',
        localField: 'vaccinationRecords.vaccine',
        foreignField: '_id',
        as: 'vaccineDetails'
      }
    },

    // Join each dose's administeredBy to user
    {
      $lookup: {
        from: 'users',
        localField: 'vaccinationRecords.doses.administeredBy',
        foreignField: '_id',
        as: 'administeredBy'
      }
    },

    // Final projection
    {
      $project: {
        _id: 1,
        blood_type: 1,
        health_condition: 1,
        notes: 1,
        createdAt: 1,

        // Newborn info
        newbornName: {
          $concat: [
            { $ifNull: ['$newborn.firstName', ''] },
            ' ',
            { $ifNull: ['$newborn.lastName', ''] }
          ]
        },
        dateOfBirth: '$newborn.dateOfBirth',
        gender: '$newborn.gender',
        birthWeight: '$newborn.birthWeight',
        birthHeight: '$newborn.birthHeight',

        // Mother info
        motherName: {
          $concat: [
            { $ifNull: ['$mother.FirstName', ''] },
            ' ',
            { $ifNull: ['$mother.LastName', ''] }
          ]
        },
        motherPhoneNumber: { $ifNull: ['$mother.phoneNumber', ''] },
        motherAddressZone: {
          $concat: [
            { $ifNull: ['$mother.address', ''] },
            ' ',
            { $ifNull: ['$newborn.zone', ''] }
          ]
        },

        // Vaccination Records with vaccineName
        vaccinationRecords: {
          $map: {
            input: '$vaccinationRecords',
            as: 'vaccinationRecord',
            in: {
              vaccine: '$$vaccinationRecord.vaccine',
              vaccineName: {
                $let: {
                  vars: {
                    matchedVaccine: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$vaccineDetails',
                            as: 'vd',
                            cond: { $eq: ['$$vd._id', '$$vaccinationRecord.vaccine'] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: '$$matchedVaccine.name'
                }
              },
              doses: {
                $map: {
                  input: '$$vaccinationRecord.doses',
                  as: 'dose',
                  in: {
                    doseNumber: '$$dose.doseNumber',
                    dateGiven: '$$dose.dateGiven',
                    next_due_date: '$$dose.next_due_date',
                    remarks: '$$dose.remarks',
                    status: '$$dose.status',
                    administeredByName: {
                      $concat: [
                        { $ifNull: ['$$dose.administeredBy.FirstName', ''] },
                        ' ',
                        { $ifNull: ['$$dose.administeredBy.LastName', ''] }
                      ]
                    },
                    administeredByRole: '$$dose.administeredBy.role'
                  }
                }
              }
            }
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: profileData
  });
});







exports.UpdateProfilling =AsyncErrorHandler(async (req,res,next) =>{
    const updateProfile=await Profile.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
            updateProfile
        
     }); 
  })


  exports.deleteProfilling = AsyncErrorHandler(async(req,res,next)=>{
    await Profile.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        data:
            null
        
     });
  })