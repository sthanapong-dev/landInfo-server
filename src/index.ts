import { OpenAPIHono } from '@hono/zod-openapi'
import { openAPIRouteHandler } from 'hono-openapi';
import { Scalar } from '@scalar/hono-api-reference'
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import timezone from "dayjs/plugin/timezone";
import apiV1 from "./service/V1";

import connectDB from '@/Configuration/mongoose';

const app = new OpenAPIHono()
const port = process.env.PORT || 8000;
const env = process.env.NODE_ENV || "development";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

// Set default timezone to Thailand
dayjs.tz.setDefault("Asia/Bangkok");

connectDB();

app.route('/', apiV1.api);

app.get(
  '/openapi',
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: 'QOrder API',
        version: '1.0.0',
        description: 'Team Stedia',
      },
      servers: [
        { url: `${env === "development" ? `http://localhost:${port}` : "https://api8000.stedia.app"}`, description: 'Local Server' },
      ],
    },
  })
)

app.get(
		"/docs",
		Scalar({
			theme: "saturn",
			layout: "modern",
			url: "/openapi",
			searchHotKey: "k",
		}),
	);

export default {
  port: port,
  hostname: "0.0.0.0",
  fetch: app.fetch,
  maxRequestBodySize: 5 * 1024 * 1024 * 1024,
};
