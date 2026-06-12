import express from "express";
// import userRoutes from "./routes/user.routes";

const app = express();

app.use(express.json());

app.get("/", (_, res) => {
  res.json({
    message: "Courier Track API Running",
  });
});

// app.use("/users", userRoutes);

export default app;
