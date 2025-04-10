const asyncHandler = require('express-async-handler');
const Task = require('../../model/taskModel');
const Group = require("../../model/groupModel");



const createTask = asyncHandler(async (req, res, next) => {
    try {

        const {
            title,
            description,
            status,
            priority,
            dueDate,
            tasksList
        } = req.body

        const {
            assignedTo,
            supervisor,
            user,
            groupId
        } = req.taskVerify

        if (!title || !description) {
            res.status(400);
            next(new Error("All input field are required"))
        }

        if (user.role !== "admin" && user.role !== "manager") {
            res.status(404);
            next(new Error("Member not permitted to create task"))
        }

        // note add task to user data
        

        const createTask = await Task.create({
            title,
            description,
            tasksList,
            assignedTo: assignedTo.assignedTo,
            supervisor: supervisor.supervisor,
            group: groupId,
            status,
            priority,
            dueDate,
            createdBy: user.userId
        })

        if (!createTask) {
            res.status(404);
            next(new Error("something went wrong while creating task"))
        }

        res.status(200).json({
            message: `${title} created successfully`
        })


    } catch (err) {
        res.status(401)
        next(new Error(err.message))
    }
})

const updateTask = asyncHandler(async (req, res, next) => {
    try {
        const {
            title,
            description,
            status,
            priority,
            dueDate,
            tasksList,
            message
        } = req.body
        const { userId } = req.user
        const taskId = req.params.id

        const access = await checkUserAccess(taskId, userId)
        console.log(access);
        
        if (!access) {
            res.status(403)
            next(new Error("You don't have access to this task"))
        }

        if (access.role === 'creator') {
            const updateTask = await Task.findByIdAndUpdate(
                taskId,
                {
                    $push: { tasksList: tasksList },
                    $set: {
                        title,
                        description,
                        priority,
                        dueDate,
                    }
                },
                {new: true}
            )

            if (message) {
                const updatedTask = await addComment(taskId, userId, message);

                if (!updatedTask) {
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
                taskId,
                {
                    $set: {
                        status,
                        priority,
                    },
                    $push: { tasksList: tasksList },
                },
                {new: true}
            )

            if (message) {
                const addComment = await addComment(taskId, userId, message);

                if (!addComment) {
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
                taskId,
                {
                    status,
                    comments: {$push: { message: message }}
                },
                {new: true}
            )

            if (message) {
                const addComment = await addComment(taskId, userId, message);

                if (!addComment) {
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