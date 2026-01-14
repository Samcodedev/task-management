const asyncHandler = require("express-async-handler");
const { User } = require('../model/userModel');
const Group = require("../model/groupModel");


const createGroup = asyncHandler(async (req, res, next) => {
    try {
        if (await Group.findOne({ groupName: req.body.groupName })) {
            res.status(400)
            next(new Error('Group name already in used try something else'))
        }

        const group = await Group.create({
            groupName: req.body.groupName,
            description: req.body.description,
            members: [
                {
                    user: req.user.userId,
                    role: 'admin'
                }
            ],
            createdBy: req.user.userId
        })

        if (!group) {
            res.status(500)
            next(new Error('something went wrong while creating group'))
        }

        if (!await User.findByIdAndUpdate(
            req.user.userId,
            {$push: {"groups": group._id}}
        )) {
            res.status(500)
            next(new Error('something went wrong while adding group to your list'))
        }

        res.status(200).json({
            success: true,
            message: `${req.body.groupName} created successfully`
        })

    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
});

const updateGroup = asyncHandler(async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id)
        if (!group) {
            res.status(404)
            next(new Error('group not found'))
        }
        
        if (req.user.userId != (group.createdBy).toString()) {
            res.status(401)
            next(new Error('User not authorize to update group'))
        }

        if (!await Group.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true })) {
            res.status(500)
            next(new Error('something went wrong while updating group'))
        }

        res.status(200).json({
            success: true,
            message: "group updated successfully"
        })
    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
    
})

module.exports = { createGroup, updateGroup }