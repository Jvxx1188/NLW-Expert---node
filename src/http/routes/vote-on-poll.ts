import { FastifyInstance } from "fastify"
import {z} from 'zod'
import {prisma} from '../../lib/prisma'
import { randomUUID } from 'crypto'
import { redis } from "../../lib/redis"
export async function voteOnPoll(app : FastifyInstance){
    app.post('/polls/:pollId/votes',async (request,reply)=>{
        const voteOnPollParams = z.object({
            pollId : z.string().uuid(),
        })
        const voteOnPollBody = z.object({
            pollOptionId : z.string().uuid(),
        })
        //veio o id e o parametro
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
        
        //veio o id e o parametro e eu tenho o id de sessção

        //ver se o usuario ja votou antes, e se votou mudar

        if(sessionId){
            const userPreviousVoteOnPoll =await prisma.vote.findUnique({
                where : {
                    sessionId_pollId : {
                        sessionId,
                        pollId
                    }
                }
            })
            if(userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId != pollOptionId){
                  //apagar voto anterior 
                  await prisma.vote.delete({
                    where: {
                        id : userPreviousVoteOnPoll.id
                    }
                  })
                redis.zincrby(pollId,-1,userPreviousVoteOnPoll.pollOptionId)
                } else if(userPreviousVoteOnPoll){
                return reply.status(400).send({message: 'user already voted on this poll'})
            }

        }
       
        //teria que fazer uma validação pra ver se o poll existe
        const option =await prisma.poll.findUnique({
            where : {
                id : pollId,
                options : {
                    some : {
                        id : pollOptionId
                    }
                }
            },
        })
        if(!option) {
            return reply.status(400).send({message : 'option not found'})
        }
        //criar voto
        await prisma.vote.create({
            data :{
                sessionId,
                pollId,
                pollOptionId
            }
        })
        await redis.zincrby(pollId,1,pollOptionId)

        return reply.send({msg : 'voto criado com sucesso'})
    })
}