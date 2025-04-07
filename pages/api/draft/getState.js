import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { ssl: "verify-full" });

// This function can now leverage a shared connection pool
export default async function handler(req, res) {
  let draftState =
    await sql`SELECT scoresUrl as "url",teamsize from draftState WHERE tournament=${req.query.tournament}`;
  draftState = draftState[0];
  console.log(draftState);

  // GETTING FRIENDS ARRAY - START
  // Step 1: Get the original ordered friends list
  const { friends: orderedFriends } = await sql`
    SELECT friends
    FROM draftstate
    WHERE tournament = ${req.query.tournament};
    `.then((rows) => rows[0]);

  // Step 2: Get the map of drafter -> players (unordered)
  const { result: rawResult } = await sql`
    SELECT jsonb_object_agg(f.drafter, COALESCE(dl.players, '[]')) AS result
    FROM (
        SELECT UNNEST(ds.friends) AS drafter
        FROM draftstate ds
        WHERE ds.tournament = ${req.query.tournament}
    ) f
    LEFT JOIN (
        SELECT dl.drafter, JSON_AGG(dl.golfer ORDER BY dl.id) AS players
        FROM draftLog dl
        WHERE dl.tournament = ${req.query.tournament}
        GROUP BY dl.drafter
    ) dl ON f.drafter = dl.drafter;
    `.then((rows) => rows[0]);

  // Step 3: Reorder in JS based on the friends array
  const friends = {};
  for (const drafter of orderedFriends) {
    friends[drafter] = rawResult[drafter] || [];
    while (friends[drafter].length !== draftState.teamsize) {
      friends[drafter].push(null);
    }
  }
  console.log(friends);
  // GETTING FRIENDS ARRAY - END

  const players = await sql`
    SELECT
        name,
        countrycode,
        amateur,
        first_masters,
        masters_wins,
        image_url
    FROM public.masters2025players;`;

  res.status(200).json({
    url: draftState.url,
    teamSize: draftState.teamsize,
    friends: friends,
    players: players,
  });
}
