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
            res.status(404)
            next(new Error('group not found'))
        }
        
        if (userId != (group.createdBy).toString()) {
            res.status(401)
            next(new Error('User not authorize to update group admin'))
        }
        
        const verifyMember = await Group.findOne({
            "members.user": memberId,
        })

        if (!verifyMember) {
            res.status(404)
            next(new Error('user not a member of the group'))
        }

        let verify = {...verifyMember._doc, memberId, userId}
        req.adminVerify = verify
        
        next()

    } catch (err) {
        res.status(401)
        next(new Error(err.message || 'User is not authorized'))
    }
})

module.exports = { adminVerification }