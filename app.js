const express = require('express');
const request = require('request');
const colors = require('colors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const MAIL_ADDR = process.env.MAIL_ADDR;
const TO_MAIL_ADDR = process.env.TO_MAIL_ADDR;

const MAIL_SMTP = process.env.MAIL_SMTP;
const MAIL_PORT = process.env.MAIL_PORT || 465;
const MAIL_SECURE = process.env.MAIL_SECURE || true;

const port = process.env.PORT || 8080;

colors.setTheme({
	silly: 'rainbow',
	input: 'grey',
	verbose: 'cyan',
	prompt: 'grey',
	info: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

const app = express();

// CORS header securiy
app.all('/*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'POST');
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
	next();
});

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

const account = { user: MAIL_USER, pass: MAIL_PASS };
const smtp = {host: MAIL_SMTP, port: MAIL_PORT, secure: MAIL_SECURE };

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
	host: smtp.host,
	port: smtp.port,
	secure: smtp.secure, // true for 465, false for other ports
	auth: {
		user: account.user,
		pass: account.pass
	}
});

const sendConfirmationEmail = (contact) => {
	const name = contact.name;
	const website = contact.website;
	const email = contact.email;
	const msg = contact.description;
	
	const mail = `
	<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html><head><META http-equiv="Content-Type" content="text/html; charset=utf-8"></head>
	<body>
		<div>
		<h1 style="text-align:center;padding-top:35px">Attorney Assistance Contact</h1>
			<div style="background-color:rgb(247,247,247);padding:20px;margin-top:30px;text-align:center">
			<div>
				<table style="margin:0 auto">
					<tr>
						<td>
							<b>Name:</b> ${name}<br>
							<b>Website:</b> <a href="${website}">${website}</a><br>
							<b>Email:</b> ${email}<br>
						</td>
					</tr>
				</table>
				<table style="margin:0 auto">
					<tr>
						<td>
							<b>Message:</b> ${msg}<br>						  
						</td>
					</tr>
				</table>
			</div>
			</div>
		</div>
	</body>
	</html>`;
	
	const mailOptions = {
		from: MAIL_ADDR, // sender address
		to: TO_MAIL_ADDR, // list of receivers
		subject: 'Attorney Assistance Contact Request', // Subject line
		//text: 'Hello world1?', // plain text body
		html: mail // html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log('Email delivery failed'.red);
			return console.log(error);
		}
	});
};

app.get('/', (req, res) => {
	res.status(200).send('Contact Attorney Listener');
	res.end('Response will be available on console, nothing to look here!');
});

app.post('/', (req, res) => {
	req.body = req.body || {};
	res.status(200).send('OK');
	res.end();

	sendConfirmationEmail(req.body);
});

app.listen(port);
const msg = 'Listening at port ' + port;
console.log(msg.green.bold);