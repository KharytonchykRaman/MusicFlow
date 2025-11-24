const express = require("express");
require('dotenv').config();

const app = express();

app.use(require("./routers/middlewareRouter"));
app.use('/api', require("./routers/guestrouter"));
app.use('/api/user', require("./routers/userRouter"));
app.use('/api/admin', require("./routers/adminRouter"));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});