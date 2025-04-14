import { config as configdotenv } from "dotenv";
import { subtle } from "crypto";

export default async (req, context) => {
	configdotenv()

	// Función asincrónica para generar el hash SHA-256
	async function _generateHash(cadena) {
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

	const orderReq = await req.json();
	console.log(orderReq);
	const unhashedOrderString = orderReq.unhashedOrderString;
	console.log(unhashedOrderString);
	// {Identificador}{Monto}{Divisa}{LlaveSecreta}
	const hashHex = await _generateHash(`${unhashedOrderString}${process.env.BOLD_TEST_PRIVKEY}`);
	console.log(JSON.stringify({ hashedOrderString: hashHex }));

	return new Response(JSON.stringify({ hashedOrderString: hashHex }), {
		headers: { "Content-Type": "application/json" },
	});
};
