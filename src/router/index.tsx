/**
 * format 路由表
 */
import { RouteObject } from "react-router-dom";
import React from "react";
import Home from "../pages/Home";
import CreatePoll from "../pages/CreatePoll";
import Vote from "../pages/Vote";
import VotingResults from "../pages/VotingResults";
import { PVDocument } from "src/pages/Documents/PVDocument";


const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/createPoll",
    element: <CreatePoll />,
  },
  {
    path: "/vote/:id",
    element: <Vote />,
  },
  {
    path: "/votingResults/:id",
    element: <VotingResults />,
  },
  {
    path: '/document',
    element: <PVDocument />
  },
  {
    path: "*",
    element: <Home />,
  }
]


export default routes;
