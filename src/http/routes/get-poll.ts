import { FastifyInstance } from "fastify"
import {z} from 'zod'
import {prisma} from '../../lib/prisma'
import { redis } from "../../lib/redis"
export async function getPoll(app : FastifyInstance){
    app.get('/polls/:pollId',async (request,reply)=>{
        const getPollParams = z.object({
            pollId : z.string().uuid(),
        })  
       const {pollId} = getPollParams.parse(request.params)
        
        const poll =await prisma.poll.findUnique({
            where : {
                id : pollId
            },
            include : {
                options : {
                    select : {
                        id : true,
                        title : true,
                    } 
                }
            }
        })
        if(!poll){
            return reply.status(404).send({message : 'poll not found'})
        }
         //total de votos em array de par e impa
        const totalVotesOnThisPoll = await redis.zrange(pollId,0,-1,'WITHSCORES')
        const reduce = totalVotesOnThisPoll.reduce((obj,line,index)=>{
            if(index % 2 == 0){
                //contagem dos votos
               const count = totalVotesOnThisPoll[index+1];

              Object.assign(obj,{[line] : count}) 
            }
            return obj
        },[] as Array<number>)
        console.log(reduce)
        return reply.send(poll)
    })
}