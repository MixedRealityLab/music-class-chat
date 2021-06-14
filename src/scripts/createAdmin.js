const crypto = require("crypto");
const {customAlphabet} = require('nanoid');
const {spawn} = require('child_process');
const readline = require("readline");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question("Admin Email: ", (emailInput) => {
	const email = emailInput.trim()
	if (email === '') {
		rl.close()
	}
	rl.question("Admin Password: ", (passwordInput) => {
		const password = passwordInput.trim().toLowerCase()
		if (password === '') {
			rl.close()
		}
		const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		const salt = customAlphabet(alphabet, 12)()

		const hashed = crypto
			.createHmac('sha512', salt)
			.update(password)
			.digest('base64')

		const adminUser = {
			_id: email,
			password: hashed,
			salt: salt,
			enabled: true
		}

		const json = JSON.stringify(adminUser) //.replaceAll('"', '\\"')

		try {
			const compose = spawn('docker-compose', ['exec', '-T', 'mongo', 'mongo', 'music-class-chat',
				'--eval', 'db.Admins.replaceOne({"_id":"' + email + '"}, ' + json + ', {"upsert": true})']);
			compose.stdout.on('data', (data) => {
				console.log(`${data}`);
			});

			compose.stderr.on('data', (data) => {
				console.error(`error: ${data}`);
			});

			compose.on('close', () => {
				rl.close()
			});
		} catch (e) {
			console.log(e)
		}
	});
});

rl.on("close", function () {
	process.exit(0);
});

