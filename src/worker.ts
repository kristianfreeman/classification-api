import { Hono } from "hono"

export type Bindings = {
  AI: Ai
  DB: D1Database
  VECTORIZE_INDEX: VectorizeIndex
}

type Classification = {
  id: number
  text: string
}

const modelName = "@cf/baai/bge-base-en-v1.5"

const app = new Hono<{ Bindings: Bindings }>()

app.get("/classifications", async c => {
  const query = "select * from classifications"
  const resp = await c.env.DB.prepare(query).all()
  const classifications = resp.results
  return c.json({ classifications })
})

app.post("/classifications", async c => {
  try {
    const { text } = await c.req.json()
    const query = "insert into classifications (text) values (?1) returning *"

    const { results } = await c.env.DB
      .prepare(query)
      .bind(text)
      .all()

    const record = results[0] as Classification
    const { id, text: recordText } = record

    const { data } = await c.env.AI.run(modelName, { text: [recordText] })
    const values = data[0]

    await c.env.VECTORIZE_INDEX.upsert([
      { id: String(id), values }
    ])

    return c.json({ classification: record })
  } catch (error: any) {
    const textUniqError = `D1_ERROR: UNIQUE constraint failed: classifications.text`
    if (error.message.includes(textUniqError)) {
      return c.json({ error: "A classification with this text already exists" }, 500)
    } else {
      return c.json({ error }, 500)
    }
  }
})

app.post("/classify", async c => {
  const { query } = await c.req.json()
  const { data } = await c.env.AI.run(modelName, { text: [query] })
  const values = data[0]

  const { matches } = await c.env.VECTORIZE_INDEX.query(values, {
    topK: 1
  })

  const match = matches[0]

  const sqlQuery = "select * from classifications where id = ?1"
  const classification = await c.env.DB.prepare(sqlQuery).bind(match.id).first()

  return c.json({
    classification,
    match,
    query
  })
})

export default app

