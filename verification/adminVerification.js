const asyncHandler = require('express-async-handler')
const Group = require("../model/groupModel");

const adminVerification = asyncHandler(async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id)
        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            })
        }
        
        if (req.user.userId != (group.createdBy).toString()) {
            res.status(401)
            next(new Error('User not authorize to update group admin'))
        }

        if (!group.members.some(member => member.user.toString() === req.body.memberId)) {
            res.status(404)
            next(new Error('Member not found in this group'))
        }

        req.adminVerify = {...group._doc, memberId: req.body.memberId, userId: req.user.userId}
        
        next()

    } catch (err) {
        res.status(401)
        next(new Error(err.message || 'User is not authorized'))
    }
})

module.exports = { adminVerification }