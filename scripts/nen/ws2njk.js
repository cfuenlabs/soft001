import { minify } from "html-minifier-terser";
import fs from "fs";
import { JSDOM } from "jsdom";


const wsToNen = async (inDir, outDir) => {
	await wsToNenFile(inDir, "index.html", outDir)
	// loop through everything and get it unless it's the assets folder
};

const wsToNenFile = async (inDir, inFileName, outDir) => {
	const webstudio_html = fs.readFileSync(`${inDir}/${inFileName}`, "utf-8");

	const better_cool_html = await minify(webstudio_html, {
		collapseWhitespace: true,
		removeComments: true,
	});

	// remove head
	const dom = new JSDOM(better_cool_html);
	const doc = dom.window.document;
	doc.querySelector("head").remove();

	// remove js links and scripts
	Array.from(doc.querySelectorAll("script")).forEach((scriptElm) =>
		scriptElm.remove()
	);

	Array.from(doc.querySelectorAll("link"))
		.filter((linkElm) => {
			const reg = /\.js/;
			return reg.test(linkElm.href);
		})
		.forEach((linkElm) => linkElm.remove());

	//const better_cool_body = doc.body.innerHTML;

	const njkWriteQueue = getNjkWriteQueue(
		getChildComponents(doc, doc.querySelector("body"))
	);

	if(Object.prototype.toString.call(njkWriteQueue) === '[object Array]') {
		njkWriteQueue.forEach((f) => {
			fs.writeFileSync(`${outDir}/${f.fileName}`, f.html, "utf-8");
		});
	} else {
			fs.writeFileSync(`${outDir}/${njkWriteQueue.fileName}`, njkWriteQueue.html, "utf-8");
	}
}

const getChildComponents = (doc, elm) => {
	//console.log(typeof elm)
	if (elm.querySelectorAll("[data-nen-map-component]").length > 0) {
		//console.log(`We found ${elm.querySelectorAll("[data-nen-map-component]").length} subcomponents`)
		let _subComponents = [];

		let subless = elm.cloneNode(true);
		Array.from(subless.querySelectorAll("[data-nen-map-component]")).forEach(
			(subElm) => {
				const _njkTag = doc.createElement("njk-component");
				_njkTag.id = subElm.id;
				subElm.replaceWith(_njkTag);
			}
		);

		Array.from(elm.querySelectorAll("[data-nen-map-component]")).forEach(
			(c) => {
				//console.log("Vamos con:")
				//console.log(elm.outerHTML)
				_subComponents.push(getChildComponents(doc, c));
			}
		);
		if (subless.id === "") {
			if (subless.nodeName !== "BODY") {
				throw Error("All Nen components must have an ID");
			} else {
				return {
					html: subless.innerHTML,
					subComponents: _subComponents,
					njkFilenameCandidate: "index",
				};
			}
		} else {
			return {
				html: subless.outerHTML,
				subComponents: _subComponents,
				njkFilenameCandidate: subless.id,
			};
		}
	} else {
		if (elm.id === "") {
		return { html: elm.innerHTML, njkFilenameCandidate: "index" };
		} else {
		return { html: elm.outerHTML, njkFilenameCandidate: elm.id };
		}
	}
};

const getNjkWriteQueue = (njkNode) => {
	let _queue = [];
	if (njkNode.subComponents) {
		njkNode.subComponents.forEach((c) => {
			_queue.push(getNjkWriteQueue(c));
		});
		const njkComponentReg = /<njk-component id="(\w+)"><\/njk-component>/g;
		const replacedNjk = njkNode.html.replaceAll(
			njkComponentReg,
			(_, id) => `{% include "${id}.njk" %}`
		);
		_queue.push({
			fileName: `${njkNode.njkFilenameCandidate}.njk`,
			html: replacedNjk,
		});
		return _queue;
	} else {
		return {
			fileName: `${njkNode.njkFilenameCandidate}.njk`,
			html: njkNode.html,
		}; // replace njk-component to actual njk references
	}
};

wsToNen("./testing/_webstudio/005/", "./testing/_results/005/")
wsToNen("./testing/_webstudio/005/productos/", "./testing/_results/005/productos")
wsToNen("./testing/_webstudio/005/nosotros", "./testing/_results/005/nosotros")
wsToNen("./testing/_webstudio/005/servicios", "./testing/_results/005/servicios")
