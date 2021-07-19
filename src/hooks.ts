import type {ServerRequest, ServerResponse} from "@sveltejs/kit/types/hooks";
import cookie from 'cookie'

export async function handle(input: {
	request: ServerRequest;
	resolve: (request: ServerRequest) => Promise<ServerResponse>;
}): Promise<ServerResponse> {
	const {request, resolve} = input
	const cookies = cookie.parse(request.headers.cookie || '')

	request.locals.session = cookies.session

	const response = await resolve(request)

	response.headers['set-cookie'] = `session=${request.locals.session || ''}; Path=/`

	return response
}