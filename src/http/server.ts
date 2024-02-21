import fastify from 'fastify'
import {z} from 'zod'
const app = fastify()
import {prisma} from '../lib/prisma'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import cookie from '@fastify/cookie'
app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)
app.register(cookie, {
    secret: "polls-app-nlw",
    hook : "onRequest"
})
app.listen({port :3333}).then((port)=>{
    console.log('listening on port ' + port)
})