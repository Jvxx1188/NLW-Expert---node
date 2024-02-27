import fastify from 'fastify'
import dotenv from 'dotenv'
const app = fastify()
import {prisma} from '../lib/prisma'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import cookie from '@fastify/cookie'
import {z} from 'zod'
dotenv.config()
app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
    hook : "onRequest"
})
app.listen({port :3333}).then((port)=>{
    console.log('listening on port ' + port)
})