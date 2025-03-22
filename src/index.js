const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");
const session = require("express-session");

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "tutalim-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.name,
    surname: req.body.surname,
    mail: req.body.mail,
    password: req.body.password,
    role: req.body.role,
  };

  const existingUser = await collection.findOne({ mail: data.mail });

  if (existingUser) {
    return res.send("User already exists. Please use a different email.");
  }
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);
  data.password = hashedPassword;

  await collection.insertMany(data);
  // res.send("User registered successfully.");
  res.redirect("/");
});

app.post("/login", async (req, res) => {
  try {
    const user = await collection.findOne({ mail: req.body.mail });
    if (!user) return res.send("User not found");

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordMatch) return res.send("Wrong Password");

    req.session.userId = user._id;
    req.session.role = user.role;

    if (user.role === "emlakçı") {
      res.redirect("/home02");
    } else if (user.role === "ev sahibi") {
      res.redirect("/home");
    } else {
      res.send("Unknown role");
    }
  } catch (err) {
    res.send("Error during login");
  }
});

// // Role kontrol middlewarelari
function roleCheck(role) {
  return (req, res, next) => {
    if (req.session.role === role) {
      next();
    } else {
      res.status(403).send("Unauthorized Access");
    }
  };
}

app.get("/home", roleCheck("ev sahibi"), (req, res) => {
  res.render("home");
});

app.get("/home02", roleCheck("emlakçı"), (req, res) => {
  res.render("home02");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send("Logout failed");
    res.redirect("/");
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const express = require("express");
// const path = require("path");
// const bcrypt = require("bcrypt");
// const collection = require("./config");
// const session = require("express-session");

// const app = express();

// app.use(express.json());
// app.use(express.static("public"));
// app.use(express.urlencoded({ extended: false }));
// app.set("view engine", "ejs");

// // Session kurulumu
// app.use(
//   session({
//     secret: "tutalim-secret-key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// // Ana Sayfa Login Formu
// app.get("/", (req, res) => {
//   res.render("login");
// });

// // Signup Formu
// app.get("/signup", (req, res) => {
//   res.render("signup");
// });

// // Signup İşlemi
// app.post("/signup", async (req, res) => {
//   const data = {
//     name: req.body.name,
//     surname: req.body.surname,
//     mail: req.body.mail,
//     password: req.body.password,
//     role: req.body.role,
//   };

//   const existingUser = await collection.findOne({ mail: data.mail });
//   if (existingUser) {
//     return res.send("User already exists. Please use a different email.");
//   }

//   const hashedPassword = await bcrypt.hash(data.password, 10);
//   data.password = hashedPassword;

//   await collection.insertMany(data);
//   res.send("User registered successfully.");
// });

// // Login İşlemi ve Session'a Kaydetme
// app.post("/login", async (req, res) => {
//   try {
//     const user = await collection.findOne({ mail: req.body.mail });
//     if (!user) return res.send("User not found");

//     const isPasswordMatch = await bcrypt.compare(
//       req.body.password,
//       user.password
//     );
//     if (!isPasswordMatch) return res.send("Wrong Password");

//     // Session'a yaz
//     req.session.userId = user._id;
//     req.session.role = user.role;

//     // Rol bazlı yönlendirme
//     if (user.role === "emlakçı") {
//       res.redirect("/home02");
//     } else if (user.role === "ev sahibi") {
//       res.redirect("/home");
//     } else {
//       res.send("Unknown role");
//     }
//   } catch (err) {
//     console.error(err);
//     res.send("Error during login");
//   }
// });

// // Role kontrol middleware
// function roleCheck(role) {
//   return (req, res, next) => {
//     if (req.session.role === role) {
//       next();
//     } else {
//       res.status(403).send("Unauthorized Access");
//     }
//   };
// }

// // Role göre korunan rotalar
// app.get("/home", roleCheck("ev sahibi"), (req, res) => {
//   res.render("home");
// });

// app.get("/home02", roleCheck("emlakçı"), (req, res) => {
//   res.render("home02");
// });

// // Logout işlemi
// app.get("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) return res.send("Logout failed");
//     res.redirect("/");
//   });
// });

// const port = 5000;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
