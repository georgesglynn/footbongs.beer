"use client";
import { useEffect, useState } from "react";
import { Box, Chip, Grid, Typography, useMediaQuery } from "@mui/material";
import Link from "next/link";
import PropTypes from "prop-types";

export default function GolfTournament(props) {
  const isDesktopView = useMediaQuery("(min-width:1024px)");
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchTournamentData(props.id);
    setInterval(() => {
      fetchTournamentData(props.id);
    }, 5000);
  }, []);

  const fetchTournamentData = (id) => {
    fetch(`/api/masters/scores?id=${id}`)
      .then((res) => res.text())
      .then((response) => {
        let scores = JSON.parse(response);
        setData(scores);
      });
  };

  const renderTournament = () => {
    return (
      <Box sx={{ margin: "auto", width: "100vw" }}>
        {buildTournamentDataSortedList().map((teamName) => {
          const players = data.friends[teamName];

          return (
            <Grid
              container
              key={teamName}
              sx={{
                textAlign: "left",
                margin: "10px",
                alignItems: "center",
                width: "95vw",
                background: "#FDE200",
                color: "#000",
                borderRadius: "5px",
                padding: "10px",
              }}
            >
              <Grid item xs={12}>
                <Typography variant="h5">{teamName}</Typography>
              </Grid>
              <Grid item xs={9}>
                {renderPlayers(players)}
              </Grid>
              <Grid item xs={3}>
                <Chip label={getTotalScore(teamName)} sx={{ background: "white" }} />
              </Grid>
            </Grid>
          );
        })}
      </Box>
    );
  };

  const buildTournamentDataSortedList = () => {
    let sorted = [];
    for (const teamName of Object.keys(data.friends)) {
      const players = data.friends[teamName];
      sorted.push({ teamName: teamName, players: players, totalScore: getTotalScore(teamName) });
    }
    sorted = sorted.sort((a, b) => a.totalScore - b.totalScore);
    return sorted.map((obj) => obj.teamName);
  };

  const renderPlayers = (players) => {
    return (
      <Box>
        {players.map((playerName) => {
          const playerData = data.players[playerName];
          return (
            <Grid container key={playerName}>
              <Grid item xs={8}>
                {playerData?.name}
              </Grid>
              <Grid item xs={4}>
                {playerData?.scoreString ? playerData?.scoreString : playerData?.teeTime}
              </Grid>
            </Grid>
          );
        })}
      </Box>
    );
  };

  const getTotalScore = (friend) => {
    let score = 0;
    for (const player of data.friends[friend]) {
      score += data.players[player]?.score;
    }
    return score;
  };

  return (
    <Box sx={{ width: "100%", height: "100%", padding: "20px 20px 20px 20px", background: "#1D4832" }}>
      <Typography variant="h3">{props.title} Leaderboard</Typography>
      {data && renderTournament()}
      <div className="link">
        <Link href="/">Home</Link>
      </div>
      <div className="link">
        <Link href="/golf">Golf Home</Link>
      </div>
    </Box>
  );
}

GolfTournament.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
