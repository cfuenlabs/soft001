import { create } from "https://esm.sh/zustand@5.0.3";

const zust = create((set, get) => ({
	products: [],

	setProducts: (products) =>
		set((state) => ({
			products: products,
		})),

	addProduct: (newProduct) =>
		set((state) => ({
			products: [...state.products, newProduct],
		})),

	removeProduct: (id) =>
		set((state) => {
			const filtered = state.products.filter((product) => product.id !== id);
			return {
				products: filtered.length > 0 ? filtered : [],
			};
		}),

	getTotalPrice: () => {
		return get().products.reduce((total, p) => total + Number(p.precio || 0), 0);
	},

	getProductNamesConcat: () => {
		return get()
			.products.map(
				({ categoria, nombre, color, almacenamiento }) =>
					(categoria ? `${categoria} ${nombre}` : nombre) +
					// --
					(color ? " " + color.nombre : "") +
					// --
					(almacenamiento ? " " + almacenamiento[0].almacenamiento : "")
			)
			.join(" + ");
	},
}));

window.cflabs.state = zust;
