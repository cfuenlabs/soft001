window.cflabs = window.cflabs || {};
window.cflabs.randomMsgs = [
  "Hola! Quiero unirme al parche de las segundas oportunidades! 😎",
  "Hola! Quiero preguntar si tienen un producto disponible 🤔💭",
  "Buenas, quería llevar mi celular y que me asesoren para repararlo 🛠",
  "Buenas, quiero comprar un iPhone nuevo con mi iPhone viejo 📱✨",
];

window.cflabs.whatsAppURL = () => `https://api.whatsapp.com/send/?phone=573503324894&text=${encodeURIComponent(
  window.cflabs.msjsRandom[
    Math.floor(Math.random() * window.cflabs.randomMsgs.length)
  ]
)}`;

window.cflabs.whatsAppProductURL = (productName, productColor, productStorage) => `https://api.whatsapp.com/send/?phone=573503324894&text=${encodeURIComponent(
	`Buen día, me gustaría comprar el ${productName}${productColor !== '' ? ' color '+productColor : ''}${productStorage !== '' ? ' con '+productStorage+'GB de espacio' : ''}`
)}`;
