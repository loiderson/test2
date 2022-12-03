const fs = require('fs');
const fastify = require('fastify')({ logger: true })

fastify.get('/', async (request, reply) => {
	const webappStream = await fs.createReadStream('../html/index.html');
	return reply.type('text/html').send(stream)
})

const start = async () => {
	  try {
		      await fastify.listen({ port: 3000 })
		    } catch (err) {
			        fastify.log.error(err)
			        process.exit(1)
			      }
}
start()
