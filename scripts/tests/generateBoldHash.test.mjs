import { config } from "dotenv";
import fs from "fs";
import { subtle } from "crypto";

import { test } from "uvu";
import * as assert from "uvu/assert";

async function generateHash(cadena) {
	// Codificar la cadena en UTF-8
	const encodedText = new TextEncoder().encode(cadena);

	// Generar el hash SHA-256
	const hashBuffer = await subtle.digest("SHA-256", encodedText);

	// Convertir el buffer del hash en un array de bytes
	const hashArray = Array.from(new Uint8Array(hashBuffer));

	// Convertir cada byte en una representación hexadecimal y unirlos en una sola cadena
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return hashHex;
}

let rata74;
let rata74_hash;

test.before(async () => {
	config();

	rata74 = `RATA74HP5000COP`;
	rata74_hash = await generateHash(`${rata74}${process.env.BOLD_TEST_PRIVKEY}`);
});

test("bold hash serverless function", async () => {
	const res = await fetch(
		"http://localhost:8888/.netlify/functions/generateBoldHash",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				unhashedOrderString: rata74,
			}),
		}
	);

	const resText = await res.text();
	const resJSON = JSON.parse(resText);

	//console.log(resJSON);
	//console.log(
	//	"Hashed result 🔐:",
	//	`${resJSON.hashedOrderString.slice(0, 6)}...${resJSON.hashedOrderString.slice(-6)}`,
	//	rata74_hash === resJSON.hashedOrderString ? "\n...Which is correct! 🧪✅" : "which is wrong. 🧪🟥:"
	//);

	assert.is(resJSON.hashedOrderString, rata74_hash);
});

test.run()
