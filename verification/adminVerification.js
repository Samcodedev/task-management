const asyncHandler = require('express-async-handler')
const Group = require("../model/groupModel");

const adminVerification = asyncHandler(async (req, res, next) => {
    try {
        const { userId } = req.user
        const groupId = req.params.id
        const {
            memberId
        } = req.body


        const group = await Group.findById(groupId)
        if (!group) {
            return res.status(404).json({
                status: "error",
                message: "Group not found"
            })
        }
        
        if (userId != (group.createdBy).toString()) {
            res.status(401)
            next(new Error('User not authorize to update group admin'))
        }

        if (!group.members.some(member => member.user.toString() === memberId)) {
            res.status(404)
            next(new Error('Member not found in this group'))
        }

        req.adminVerify = {...group._doc, memberId, userId}
        
        next()

    } catch (err) {
        res.status(401)
        next(new Error(err.message || 'User is not authorized'))
    }
})

module.exports = { adminVerification }