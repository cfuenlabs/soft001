window.cflabs.bold = {};

class ButtonBuilder {
	constructor() {
		this.attrs = {
			"data-bold-button": "",
		};
	}

	boldButton(theme) {
		this.attrs["data-bold-button"] = theme;
		return this;
	}

	orderId(idOrFn) {
		this._orderIdSource = idOrFn;
		return this;
	}

	currency(curr) {
		this.attrs["data-currency"] = curr;
		return this;
	}

	amount(value) {
		this.attrs["data-amount"] = value;
		return this;
	}

	apiKey(key) {
		this.attrs["data-api-key"] = key;
		return this;
	}

	integritySignature(hash) {
		this.attrs["data-integrity-signature"] = hash;
		return this;
	}

	redirectionUrl(url) {
		this.attrs["data-redirection-url"] = url;
		return this;
	}

	description(desc) {
		this.attrs["data-description"] = desc;
		return this;
	}

	tax(tax) {
		this.attrs["data-tax"] = tax;
		return this;
	}

	customerData(obj) {
		this.attrs["data-customer-data"] = JSON.stringify(obj);
		return this;
	}

	billingAddress(obj) {
		this.attrs["data-billing-address"] = JSON.stringify(obj);
		return this;
	}

	expirationDate(timestamp) {
		this.attrs["data-expiration-date"] = timestamp;
		return this;
	}

	originUrl(url) {
		this.attrs["data-origin-url"] = url;
		return this;
	}

	extraData1(data) {
		this.attrs["data-extra-data-1"] = data;
		return this;
	}

	extraData2(data) {
		this.attrs["data-extra-data-2"] = data;
		return this;
	}

	build() {
		if (!this._orderIdSource) {
			throw new Error(`Missing required field: orderId`);
		}
		if (!this.attrs["data-integrity-signature"]) {
			throw new Error(`Missing required field: integritySignature`);
		}

		const resolvedOrderId =
			typeof this._orderIdSource === "function"
				? this._orderIdSource()
				: this._orderIdSource;

		this.attrs["data-order-id"] = resolvedOrderId;

		const script = document.createElement("script");
		for (const [key, value] of Object.entries(this.attrs)) {
			script.setAttribute(key, value);
		}
		return script;
	}

	update(selector = "[data-bold-button]") {
		if (!this._orderIdSource) {
			throw new Error(`Missing required field: orderId`);
		}
		if (!this.attrs["data-integrity-signature"]) {
			throw new Error(`Missing required field: integritySignature`);
		}

		const resolvedOrderId =
			typeof this._orderIdSource === "function"
				? this._orderIdSource()
				: this._orderIdSource;

		this.attrs["data-order-id"] = resolvedOrderId;

		const el = document.querySelector(selector);
		if (!el) return null;

		for (const [key, value] of Object.entries(this.attrs)) {
			el.setAttribute(key, value);
		}

		return el;
	}

	get() {
		return this.build().outerHTML;
	}
}

window.cflabs.bold.buttonBuilder = new ButtonBuilder();

const getOrderExpirationTimestamp = (hours) =>
	Date.now() * 1_000_000 + hours * 60 * 60 * 1_000_000_000;

window.cflabs.bold.getOrderExpirationTimestamp = getOrderExpirationTimestamp;

const getIntegrityHash = async (unhashedOrderString) => {
	const _res = await fetch("/.netlify/functions/generateBoldHash", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			unhashedOrderString: unhashedOrderString,
		}),
	});

	const resText = await _res
		.json()
		.then((resJSON) => resJSON.hashedOrderString);
	return resText;
};

window.cflabs.bold.getIntegrityHash = getIntegrityHash;

window.cflabs.bold.setOrderInfo = async () => {
	const products = window.cflabs.state.getState().products;
	const amount = window.cflabs.state.getState().getTotalPrice();
	const description = window.cflabs.state.getState().getProductNamesConcat();

	const unhashedOrderString = window.cflabs.utils.getCFLSTAMP("001", "cash");
	console.log(unhashedOrderString)
	const hashedOrderString = await window.cflabs.bold.getIntegrityHash(
		`${unhashedOrderString}${amount}COP`
	);

	window.cflabs.bold.buttonBuilder
		.boldButton("dark-L")
		.orderId(unhashedOrderString)
		.currency("COP")
		.amount(`${amount}`)
		.integritySignature(hashedOrderString)
		.description(description)
		.expirationDate(window.cflabs.bold.getOrderExpirationTimestamp(5))
		.originUrl(window.location)
		.redirectionUrl(window.location.origin)
		.extraData1("Comprado mediante sitio web de iPhoneShop")
		.build()
};

window.cflabs.bold.setCustomerData = () => {
	window.cflabs.bold.buttonBuilder
		.customerData({
			email: document.querySelector("input#CustomerEmail").value,
			fullName: document.querySelector("input#CustomerFullName").value,
			phone: document.querySelector("input#CustomerPhoneNumber").value,
			documentNumber: document.querySelector("input#CustomerDocumentNumber")
				.value,
			documentType: document.querySelector("select#CustomerDocumentType").value,
		})
		.billingAddress({
			city: document.querySelector("input#CustomerCityOfResidence").value,
		})
		.build()
};
