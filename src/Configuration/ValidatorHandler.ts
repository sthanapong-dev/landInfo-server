import { Context } from "hono";
import _ from "lodash";

export default (result: any, c: Context) => {
	const issues = _.get(result, "error.issues", []);
	let errors = [];
	c.set('transform_body',result.data)
	if (issues.length > 0) {
		errors = issues.map((item: any) => `The ${item.path.join(".")} fields ${_.lowerCase(String(item.message))}`);
	}
	if (errors.length > 0) {
		return c.json({ status: false, errors }, 400);
	}
};
