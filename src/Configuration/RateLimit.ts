//Rate Limiting Middleware
// import { Middleware } from 'itty-router-middleware';
// import { redisClient } from '../Configuration/Redis.js';
// import { HonoContext } from 'hono';

// interface RateLimitOptions {
//   windowSizeInSeconds: number; 
//   maxRequests: number; 
// }   

// export function rateLimit(options: RateLimitOptions): Middleware<HonoContext> {
//   return async (c:any, next:any) => {
//     const clientIp = c.req.headers.get('x-forwarded-for') || c.req.headers.get('host') || 'unknown';    
//     const currentTimestamp = Math.floor(Date.now() / 1000);
//     const windowStartTimestamp = currentTimestamp - options.windowSizeInSeconds;
//     const redisKey = `rate_limit:${clientIp}`;  
//     await redisClient.zRemRangeByScore(redisKey, 0, windowStartTimestamp);
//     const requestCount = await redisClient.zCard(redisKey);

//     if (requestCount >= options.maxRequests) {
//       return c.json({ message: 'Too Many Requests' }, 429);
//     }
//     await redisClient.zAdd(redisKey, {
//         score: currentTimestamp,
//         member: currentTimestamp
//     });
//     await next();
//   };
// }