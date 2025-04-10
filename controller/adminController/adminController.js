const asyncHandler = require("express-async-handler");
const { User } = require('../../model/userModel');
const Group = require("../../model/groupModel");


const setRole = asyncHandler(async (req, res, next) => {
    try {
        const {
            _id,
            memberId
        } = req.adminVerify
        const groupId = _id
        const { role } = req.body

        const verifyMember = await Group.findOne({
            "members.user": memberId,
        })

        if (!verifyMember) {
            res.status(404)
            next(new Error('user not a member of the group'))
        }

        if (!["admin", "manager", "member"].includes(role)) {
            res.status(400)
            next(new Error('Unauthorized role'));
        }

        if (role == 'admin' || role == 'manager') {
            const verifyAdminCount = await Group.aggregate([
                { $match: { _id: groupId } },
                { $project: { adminCount: { $size: { $filter: { input: "$members", as: "member", cond: { $eq: ["$$member.role", `${role}`] } } } } } }
            ]);

            const adminCount = verifyAdminCount[0]?.adminCount || 0

            if (role == 'admin' && adminCount >= 2 ) {
                res.status(500)
                next(new Error(`${role} can't exceed 2`))
            }

            if (role == 'manager' && adminCount >= 10) {
                res.status(500)
                next(new Error(`${role} can't exceed 10`))
            }
        }
        
        const member = await Group.findOneAndUpdate(
            { _id: groupId, "members.user": memberId },
            { $set: { "members.$.role": role } },
            { new: true, runValidators: true }
        )

        if (!member) {
            res.status(500)
            next(new Error(`something went wrong while setting ${role}`))
        }

        res.status(200).json({message: `${role} set successfully`})

    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
})

const addMember = asyncHandler(async (req, res, next) => {
    try {
        const { userId } = req.user
        const groupId = req.params.id
        const {
            newMemberId
        } = req.body
        

        const group = await Group.findById(groupId)
        if (!group) {
            res.status(404)
            next(new Error('group not found'))
        }
        
        if (userId != (group.createdBy).toString()) {
            res.status(401)
            next(new Error('User not authorize to update group admin'))
        }

        const checkNewMember = await Group.findOne({
            "members.user": newMemberId,
        })

        if (checkNewMember) {
            res.status(404)
            next(new Error('user already added to the group'))
        }

        if (!await User.findById(newMemberId)) {
            res.status(404)
            next(new Error('user do not exist'))
        }

        if (!await Group.findByIdAndUpdate(
            groupId,
            {
                $push: { members: { user: newMemberId } },
            },
            { new: true, runValidators: true }
        )) {
            res.status(500)
            next(new Error('something went wrong while adding user'))
        }

        if (!await User.findByIdAndUpdate(newMemberId,{$push: {"groups": groupId}})) {
            res.status(500)
            next(new Error('something went wrong while adding group to member list'))
        }

        console.log(addUserNewMember);
        

        res.status(200).json({ 
            message: "user added successfully."
        })
    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
})

const removeMember = asyncHandler(async (req, res, next) => {
    try {
        const {
            _id,
            memberId,
        } = req.adminVerify
        const groupId = _id.toString()

        const removeMember = await Group.findByIdAndUpdate(
            groupId,
            { $pull: { members: { user: memberId } } },
            { new: true }
        );

        if (!removeMember) {
            res.status(500)
            next(new Error('something went wrong while deleting member'))
        }

        if (!await User.findByIdAndUpdate(
            memberId,
            { $pull: { groups: groupId}}
        )) {
            res.status(500)
            next(new Error('something went wrong while updating your groups'))
        }

        res.status(200).json({ 
            message: "member removed successfully."
        })
        

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

module.exports = { setRole, addMember, removeMember }