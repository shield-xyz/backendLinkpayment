const z = require("zod");

const TickerResponseSchema = z.object({
  error: z.array(z.string()),
  result: z
    .record(
      z.object({
        a: z.array(z.string()),
        b: z.array(z.string()),
        c: z.array(z.string()),
        v: z.array(z.string()),
        p: z.array(z.string()),
        t: z.array(z.number()),
        l: z.array(z.string()),
        h: z.array(z.string()),
        o: z.string(),
      })
    )
    .optional(),
});

module.exports = { TickerResponseSchema };
