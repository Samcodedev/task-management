const request = require('supertest');
const app = require('../index')
const mongoose = require('mongoose')


let user;
description('', () => {
    beforeAll(async () => {
        
    })

    afterAll(async () => {
        
    })

    description('POST /api/v1/user/register', () => {
        it('Should be able to register user', async () => {
            const data = {
                firstName: 'test-firstName',
                lastName: 'test-lastName',
                UserName: 'test-userName',
                phoneNumber: '1234567890',
                email: "example@gmail.com",
                password: "Password.1234"
            }
            const res = await request(app)
                .post('/api/v1/user/login')
                .send(data)
            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)

            user = res.body.data.token
        })
    })
})