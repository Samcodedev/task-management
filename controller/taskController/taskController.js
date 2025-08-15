const asyncHandler = require('express-async-handler');
const Task = require('../../model/taskModel');
const User = require('../../model/userModel');


const createTask = asyncHandler(async (req, res, next) => {
    try {
        if (req.taskVerify.user.role !== "admin" && req.taskVerify.user.role !== "manager") {
            res.status(404);
            next(new Error("Member not permitted to create task"))
        }

        const createTask = await Task.create({
            title: req.body.title,
            description: req.body.description,
            tasksList: req.body.tasksList,
            assignedTo: req.taskVerify.assignedTo.assignedTo,
            supervisor: req.taskVerify.supervisor.supervisor,
            group: req.taskVerify.groupId,
            status: req.body.status,
            priority: req.body.priority,
            dueDate: req.body.dueDate,
            createdBy: req.taskVerify.user.userId
        })

        if (!createTask) {
            res.status(404);
            next(new Error("something went wrong while creating task"))
        }

        const allUserIds = [req.taskVerify.assignedTo.assignedTo, req.taskVerify.supervisor.supervisor];

        await Promise.all(
            allUserIds.map(userId  =>
                User.findByIdAndUpdate(
                    userId,
                    { $addToSet: { tasksAssigned: createTask._id } }
                )
            )
        );

        res.status(200).json({
            message: `${req.body.title} created successfully`
        })


    } catch (err) {
        res.status(401)
        next(new Error(err.message))
    }
})

const updateTask = asyncHandler(async (req, res, next) => {
    try {
        const access = await checkUserAccess(req.params.id, req.user.userId)
        
        if (!access) {
            res.status(403)
            next(new Error("You don't have access to this task"))
        }

        if (access.role === 'creator') {
            const updateTask = await Task.findByIdAndUpdate(
                req.params.id,
                {
                    $push: { tasksList: req.body.tasksList },
                    $set: {
                        title: req.body.title,
                        description: req.body.description,
                        priority: req.body.priority,
                        status: req.body.status,
                        dueDate: req.body.dueDate,
                    }
                },
                {new: true}
            )

            if (req.body.message) {
                const addComments = await addComment(req.params.id, req.user.userId, req.body.message);

                if (!addComments) {
                    return res.status(404).json({ 
                        message: "unable to add comment" 
                    });
                }
            }

            if (!updateTask) {
                res.status(403)
                next(new Error("something went wrong while updating task"))
            }

            res.status(200).json({ 
                message: "task updated successfully."
            })
        }

        if (access.role === 'supervisor') {
            const updateTask = await Task.findByIdAndUpdate(
                req.params.id,
                {
                    $set: {
                        status: req.body.status,
                        priority: req.body.priority,
                    },
                    $push: { tasksList: req.body.tasksList },
                },
                {new: true}
            )

            if (req.body.message) {
                const addComments = await addComment(req.params.id, req.user.userId, req.body.message);

                if (!addComments) {
                    return res.status(404).json({ 
                        message: "unable to add comment" 
                    });
                }
            }

            if (!updateTask) {
                res.status(403)
                next(new Error("something went wrong while updating task"))
            }

            res.status(200).json({ 
                message: "task updated successfully."
            })
        }

        if (access.role === 'assignee') {
            const updateTask = await Task.findByIdAndUpdate(
                req.params.id,
                {
                    status: req.body.status,
                    comments: {$push: { message: req.body.message }}
                },
                {new: true}
            )

            if (req.body.message) {
                const addComments = await addComment(req.params.id, req.user.userId, req.body.message);

                if (!addComments) {
                    return res.status(404).json({ 
                        message: "unable to add comment" 
                    });
                }
            }

            if (!updateTask) {
                res.status(403)
                next(new Error("something went wrong while updating task"))
            }

            res.status(200).json({ 
                message: "task updated successfully."
            })
        }

    } catch (err) {
        res.status(401)
        next(new Error(err.message))
    }
})

const checkUserAccess = async (taskId, userId) => {
    try {
        const task = await Task.findOne({
            _id: taskId,
            $or: [
                { supervisor: userId },
                { createdBy: userId },
                { assignedTo: { $in: [userId] } }
            ]
        });

        if (!task) {
            return null;
        }
        
        let roles = [];
        if (task.supervisor && task.supervisor.equals(userId)) roles.push('supervisor');
        if (task.createdBy.equals(userId)) roles.push('creator');
        if (task.assignedTo.some(id => id.equals(userId))) roles.push('assignee');

        return {
            roles,
            role: roles[0]
        };

    } catch (err) {
        res.status(401)
        throw new Error(err.message)
    }
}

const addComment = async (taskId, userId, message) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                $push: {
                    comments: {
                        user: userId,
                        message: message,
                        timestamp: new Date()
                    }
                }
            },
            { 
                new: true,
                runValidators: true
            }
        );

        return updatedTask;
    } catch (err) {
        res.status(401)
        throw new Error(err.message)
    }
};




module.exports = { createTask, updateTask }