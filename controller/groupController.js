const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require('../model/userModel');
// const { sendEmail } = require('../middleWare/handleMail');
const Group = require("../model/groupModel");


const createGroup = asyncHandler(async (req, res) => {
    try {
        const {
            groupName,
            description,
        } = req.body

        const { userId } = req.user


        if (!groupName || !description) {
            res.status(400)
            throw new Error('All input are required')
        }

        const groupExists = await Group.findOne({ groupName })
        if (groupExists) {
            res.status(400)
            throw new Error('Group name already in used try something else')
        }

        let groupData = {
            groupName,
            description,
            members: [
                {
                    user: userId,
                    role: 'admin'
                }
            ],
            createdBy: userId
        }

        const group = await Group.create(groupData)

        const addToUserGroup = await User.findByIdAndUpdate(
            userId,
            {$push: {"groups": group._id}}
        )

        if (!group) {
            res.status(500)
            throw new Error('something went wrong while creating group')
        }

        if (!addToUserGroup) {
            res.status(500)
            throw new Error('something went wrong while adding group to your list')
        }

        res.status(200).json({
            message: `${groupName} created successfully`
        })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const updateGroup = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.user
        const groupId = req.params.id

        const group = await Group.findById(groupId)
        if (!group) {
            res.status(404)
            throw new Error('group not found')
        }
        
        if (userId != (group.createdBy).toString()) {
            res.status(401)
            throw new Error('User not authorize to update group')
        }

        const updateGroup = await Group.findByIdAndUpdate(groupId, { ...req.body }, { new: true })
        if (!updateGroup) {
            res.status(500)
            throw new Error('something went wrong while updating group')
        }

        res.status(200).json({message: "group updated successfully"})
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
})

module.exports = { createGroup, updateGroup }