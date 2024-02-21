import { FastifyInstance } from "fastify"
import {z} from 'zod'
import {prisma} from '../../lib/prisma'
import { randomUUID } from 'crypto'
export async function voteOnPoll(app : FastifyInstance){
    app.post('/polls/:pollId/votes',async (request,reply)=>{
        const voteOnPollParams = z.object({
            pollId : z.string().uuid(),
        })
        const voteOnPollBody = z.object({
            pollOptionId : z.string().uuid(),
        })

       const {pollOptionId} = voteOnPollBody.parse(request.body)
       const {pollId} = voteOnPollParams.parse(request.params)
       
        let {sessionId} = request.cookies
        if(!sessionId){
            sessionId = randomUUID()
            reply.setCookie('sessionId',sessionId,{
                path : '/',
                maxAge : 60 * 60 * 24 * 30,
                httpOnly: true,
                signed : true,
            })
            
        }
        return reply.send({msg : sessionId})
    })
}