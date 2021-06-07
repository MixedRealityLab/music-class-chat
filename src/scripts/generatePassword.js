import crypto from "crypto";
import {customAlphabet} from "nanoid";

const password = 'notastrongpassword'

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const salt = customAlphabet(alphabet, 12)()
console.log(salt)

const hashed = crypto
	.createHmac('sha512', salt)
	.update(password)
	.digest('base64')

console.log(hashed)