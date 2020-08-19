const express = require('express')
const cors = require('cors')
const Repository = require('./models/Repository')
const { isUuid } = require('uuidv4')

const app = express()

app.use(express.json())
app.use(cors())

const repositories = []

function validateRepositoryIdParams (request, response, next) {
  const { id } = request.params
  if (!isUuid(id)) return response.status(400).json({ error: 'RepositoryId invalid' })

  next()
}

app.use('/repositories/:id', validateRepositoryIdParams)
app.use('/repositories/:id/like', validateRepositoryIdParams)

app.get('/repositories', (request, response) => {
  response.json(repositories)
})

app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body

  if (!title || !url || !techs) return response.status(400).json({ error: 'Repository body invalid' })

  const repository = new Repository({ title, url, techs })

  repositories.push(repository)

  response.status(201).json(repository)
})

app.put('/repositories/:id', (request, response) => {
  const { id } = request.params
  const { title, url, techs } = request.body

  const repoIndex = repositories.findIndex(repo => repo.id === id)
  if (repoIndex < 0) { return response.status(400).json({ error: 'Repository not found' }) }

  Object.assign(repositories[repoIndex], { title, url, techs })

  response.status(202).json(repositories[repoIndex])
})

app.delete('/repositories/:id', async (request, response) => {
  const { id } = request.params

  const repoIndex = repositories.findIndex(repo => repo.id === id)
  if (repoIndex < 0) { return response.status(400).json({ error: 'Repository not found' }) }

  await repositories.splice(repoIndex, 1)
  response.status(204).send()
})

app.post('/repositories/:id/like', (request, response) => {
  const { id } = request.params

  const repoIndex = repositories.findIndex(repo => repo.id === id)
  if (repoIndex < 0) { return response.status(400).json({ error: 'Repository not found' }) }

  repositories[repoIndex].likes++
  response.status(201).json(repositories[repoIndex])
})

module.exports = app
