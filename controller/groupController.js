const asyncHandler = require("express-async-handler");
const { User } = require('../model/userModel');
const Group = require("../model/groupModel");


const createGroup = asyncHandler(async (req, res, next) => {
    try {
        const {
            groupName,
            description,
        } = req.body

        const { userId } = req.user


        if (!groupName || !description) {
            res.status(400)
            next(new Error('All input are required'))
        }

        if (await Group.findOne({ groupName })) {
            res.status(400)
            next(new Error('Group name already in used try something else'))
        }

        const group = await Group.create({
            groupName,
            description,
            members: [
                {
                    user: userId,
                    role: 'admin'
                }
            ],
            createdBy: userId
        })

        if (!group) {
            res.status(500)
            next(new Error('something went wrong while creating group'))
        }

        if (!await User.findByIdAndUpdate(
            userId,
            {$push: {"groups": group._id}}
        )) {
            res.status(500)
            next(new Error('something went wrong while adding group to your list'))
        }

        res.status(200).json({
            success: true,
            message: `${groupName} created successfully`
        })

    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
});

const updateGroup = asyncHandler(async (req, res, next) => {
    try {
        const { userId } = req.user
        const groupId = req.params.id

        const group = await Group.findById(groupId)
        if (!group) {
            res.status(404)
            next(new Error('group not found'))
        }
        
        if (userId != (group.createdBy).toString()) {
            res.status(401)
            next(new Error('User not authorize to update group'))
        }

        if (!await Group.findByIdAndUpdate(groupId, { ...req.body }, { new: true })) {
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