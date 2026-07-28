import { Redis } from "@upstash/redis";

const redis=process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN?new Redis({url:process.env.UPSTASH_REDIS_REST_URL,token:process.env.UPSTASH_REDIS_REST_TOKEN}):null;
export async function acquireTransientKey(key:string,ttlSeconds:number){if(!redis)return true;return (await redis.set(key,"1",{nx:true,ex:ttlSeconds}))==="OK"}
export async function rateLimit(key:string,limit:number,windowSeconds:number){if(!redis)return true;const bucket=Math.floor(Date.now()/1000/windowSeconds);const redisKey=`hrms:r4:rate:${key}:${bucket}`;const count=await redis.incr(redisKey);if(count===1)await redis.expire(redisKey,windowSeconds);return count<=limit}
