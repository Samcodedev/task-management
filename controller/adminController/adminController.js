const asyncHandler = require("express-async-handler");
const { User } = require('../../model/userModel');
const Group = require("../../model/groupModel");


const setRole = asyncHandler(async (req, res, next) => {
    try {
        if (!["admin", "manager", "member"].includes(req.body.role)) {
            res.status(400)
            next(new Error('Unauthorized role'));
        }

        if (req.body.role == 'admin' || req.body.role == 'manager') {
            const verifyAdminCount = await Group.aggregate([
                { $match: { _id: req.adminVerify._id } },
                { $project: { adminCount: { $size: { $filter: { input: "$members", as: "member", cond: { $eq: ["$$member.role", `${req.body.role}`] } } } } } }
            ]);

            const adminCount = verifyAdminCount[0]?.adminCount || 0

            if (req.body.role == 'admin' && adminCount >= 2 ) {
                res.status(500)
                next(new Error(`${req.body.role} can't exceed 2`))
            }

            if (req.body.role == 'manager' && adminCount >= 6) {
                res.status(500)
                next(new Error(`${req.body.role} can't exceed 6`))
            }
        }
        
        const member = await Group.findOneAndUpdate(
            { _id: req.adminVerify._id, "members.user": req.adminVerify.memberId },
            { $set: { "members.$.role": req.body.role } },
            { new: true, runValidators: true }
        )

        if (!member) {
            res.status(500)
            next(new Error(`something went wrong while setting ${req.body.role}`))
        }

        res.status(200).json({
            success: true,
            message: `${req.body.role} set successfully`
        })

    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
})

const addMember = asyncHandler(async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id)
        if (!group) {
            res.status(404)
            next(new Error('group not found'))
        }
        
        if (req.user.userId != (group.createdBy).toString()) {
            res.status(401)
            next(new Error('User not authorize to update group admin'))
        }

        if (await Group.findOne({
            "members.user": req.body.newMemberId,
        })) {
            res.status(404)
            next(new Error('user already added to the group'))
        }

        if (!await User.findById(req.body.newMemberId)) {
            res.status(404)
            next(new Error('user do not exist'))
        }

        if (!await Group.findByIdAndUpdate(
            req.params.id,
            {
                $push: { members: { user: req.body.newMemberId } },
            },
            { new: true, runValidators: true }
        )) {
            res.status(500)
            next(new Error('something went wrong while adding user'))
        }

        if (!await User.findByIdAndUpdate(req.body.newMemberId,{$push: {"groups": req.params.id}})) {
            res.status(500)
            next(new Error('something went wrong while adding group to member list'))
        }
        

        res.status(200).json({ 
            success: true,
            message: "user added successfully."
        })
    } catch (err) {
        res.status(500)
        next(new Error(err.message))
    }
})

const removeMember = asyncHandler(async (req, res, next) => {
    try {
        if (!await Group.findByIdAndUpdate(
            req.adminVerify._id.toString(),
            { $pull: { members: { user: req.adminVerify.memberId } } },
            { new: true }
        )) {
            res.status(500)
            next(new Error('something went wrong while deleting member'))
        }

        if (!await User.findByIdAndUpdate(
            req.adminVerify.memberId,
            { $pull: { groups: req.adminVerify._id.toString()}}
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