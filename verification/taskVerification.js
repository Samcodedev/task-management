const asyncHandler = require('express-async-handler')
const Group = require("../model/groupModel");


const taskAssignVerification = asyncHandler(async (req, res, next) => {
    try {
        if (!await Group.findById(req.params.id)) {
            res.status(404)
            next(new Error('group not found'))
        }
    
        const checkUser = await checkUserInGroup(req.params.id, req.user.userId)
        if (checkUser === null) {
            res.status(404)
            next(new Error("You're not on this group"))
        }
    
        const checkAssigned = await checkUserInGroup(req.params.id, req.body.assignedTo)
        if (checkAssigned === null) {
            res.status(404)
            next(new Error('user assigned not in group'))
        }
    
        const checkSupervisor = await checkUserInGroup(req.params.id, req.body.supervisor)
        if (checkSupervisor === null) {
            res.status(404)
            next(new Error('supervisor not in group'))
        }

        


        let verify = { 
            assignedTo: {
                assignedTo: req.body.assignedTo, 
                role: checkAssigned.role
            },
            supervisor: {
                supervisor: req.body.supervisor,
                role: checkSupervisor.role 
            },
            user: {
                userId: req.user.userId,
                role: checkUser.role
            },
            groupId: req.params.id
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