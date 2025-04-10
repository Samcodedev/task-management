const asyncHandler = require('express-async-handler')
const Group = require("../model/groupModel");


const taskAssignVerification = asyncHandler(async (req, res, next) => {
    try {
        const {
            assignedTo,
            supervisor
        } = req.body
        const { userId } = req.user
        const groupId = req.params.id
        
        
        const group = await Group.findById(groupId)
        if (!group) {
            res.status(404)
            next(new Error('group not found'))
        }
    
        const checkUser = await checkUserInGroup(groupId, userId)
        if (checkUser === null) {
            res.status(404)
            next(new Error('user not on the group'))
        }
    
        const checkAssigned = await checkUserInGroup(groupId, assignedTo)
        if (checkAssigned === null) {
            res.status(404)
            next(new Error('user assigned not in group'))
        }
    
        const checkSupervisor = await checkUserInGroup(groupId, supervisor)
        if (checkSupervisor === null) {
            res.status(404)
            next(new Error('supervisor not in group'))
        }

        // console.log('good to go');

        let verify = { 
            assignedTo: {
                assignedTo, 
                role: checkAssigned.role
            },
            supervisor: {
                supervisor,
                role: checkSupervisor.role 
            },
            user: {
                userId,
                role: checkUser.role
            },
            groupId
        }

        req.taskVerify = verify
        next()
        
    } catch (err) {
        res.status(401)
        next(new Error(err.message || 'User is not authorized'))
    }
    



})

const checkUserInGroup = async (groupId, userId) => {
    try {
        const group = await Group.findOne(
          { _id: groupId, "members.user": userId },
          { members: { $elemMatch: { user: userId } } }
        );
    
        if (!group || group.members.length === 0) {
          return null;
        }
    
        const member = group.members[0];
        return member;

      } catch (error) {
        return null;
      }
};
  

module.exports = { taskAssignVerification }