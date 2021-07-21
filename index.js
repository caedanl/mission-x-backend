// Imports/require
const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

// Declaring local variables with .env details
const db_host = process.env.DB_HOST;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;

// Creates sql connection using details from .env file
const db = mysql.createConnection({
	host: db_host,
	user: db_user,
	password: db_password,
	database: "mission_x",
});

// Sets up app to accept json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Logs if connection is successful
db.connect((err) => console.log(err || "Connection Successful"));

// Project list endpoint
app.get("/projects", (req, res) => {
	console.log('Query to /projects');
	db.query("SELECT * FROM project", (err, results) => {
		if (results.length) {
			res.status(200).send(results);
		} else {
			res.status(400).send("There was an error");
		}
	});
});

// Endpoint for a specific project
app.get("/project", (req, res) => {
	console.log('Query to /project');
	db.query(
		"SELECT * FROM project where project_id = ?",
		[req.query.project],
		(err, results) => {
			if (results.length) {
				res.status(200).send(results);
			} else {
				res.status(400).send("The requested project does not exist");
			}
		}
	);
});

// Simple endpoint to return the number of rows in a given table
app.get("/count", (req, res) => {
	console.log('Query to /count looking for: ' + req.query.table);
	db.query(`SELECT COUNT(*) FROM ${req.query.table}`, (err, results) => {
		if (err) {
			res.status(400)
				.send(
					err.code === "ER_NO_SUCH_TABLE"
						? "The table does not exist"
						: "Unknown error"
				);
		} else if (results.length) {
			res.status(200).send({ count: results[0][Object.keys(results[0])[0]] });
		} else {
			res.status(400).send("There was an error requesting the number of rows");
		}
	});
});

app.get("/projectindex", (req, res) => {
	console.log('Query to /projectindex looking for: ' + req.query.project);
	db.query(
		`WITH project AS ( SELECT project_id, project_number, row_number() OVER ( ORDER BY project_number) AS 'rownumber' FROM project ) SELECT project_id, rownumber FROM project WHERE project_id = ?`,
		[req.query.project],
		(err, results) => {
			res.send({ index: results[0].rownumber });
		}
	);
});

app.get("/users", (req, res) => {
	console.log('Query to /user');
	db.query(
		"SELECT first_name, last_name, school, date_of_birth, profile_pic, contact_number, email, course FROM users JOIN progress_history ON users.user_id = progress_history.user_id JOIN project ON project.project_id = progress_history.project_id WHERE role = 'student' ",
		(err, result) => {
			res.send(result);
		}
	);
});

app.get("/userslogged", (req, res) => {
	console.log('Query to /userslogged');
	db.query("SELECT * FROM users", (err, result) => {
		res.send(result);
	});
});

// The backend can now be queried at localhost:4000
app.listen(4000);
