// * VARIABLES Y SELECTORES
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

// * EVENTOS
eventListeners();
function eventListeners() {
	document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
	formulario.addEventListener('submit', agregarGasto);
}

// * CLASSES

class Presupuesto {
	constructor(presupuesto) {
		this.presupuesto = Number(presupuesto);
		this.restante = Number(presupuesto);
		this.gastos = [];
	}

	nuevoGasto(gasto) {
		this.gastos = [...this.gastos, gasto];
		// console.log(this.gastos);
		this.calcularRestante();
	}

	calcularRestante() {
		const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidadGasto, 0);
		this.restante = this.presupuesto - gastado;
	}

	eliminarGasto(id) {
		this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
		this.calcularRestante();
		// console.log(this.gastos);
	}
}

// Métodos que van a imprimir html
class UI {
	insertarPresupuesto(presupuestoInsertado) {
		// console.log(cantidad);

		// Extrayendo los valores del objeto
		const { presupuesto, restante } = presupuestoInsertado;

		// Insertando los valores en el HTML
		document.querySelector('#total').textContent = presupuesto;
		document.querySelector('#restante').textContent = restante;
	}

	imprimirAlerta(mensaje, tipo) {
		const existeAlerta = document.querySelector('.alerta');

		if (!existeAlerta) {
			const divAlerta = document.createElement('div');
			divAlerta.classList.add('alert', 'text-center', 'alerta');

			if (tipo === 'error') {
				divAlerta.classList.add('alert-danger');
			} else {
				divAlerta.classList.add('alert-success');
			}

			divAlerta.textContent = mensaje;

			document.querySelector('.primario').insertBefore(divAlerta, formulario);

			setTimeout(() => {
				divAlerta.remove();
			}, 3000);
		}
	}

	mostrarGastos(gastos) {
		// console.log(gastos);

		// Limpiamos el html para que al insertar mas registros, no los repita
		limpiarHTML();

		// Iterar sobre los gastos
		gastos.forEach((gasto) => {
			const { nombreGasto, cantidadGasto, id } = gasto;

			// Crear LI
			const nuevoGasto = document.createElement('li');
			nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
			nuevoGasto.dataset.id = id;
			// console.log(nuevoGasto);

			// Agregar el HTML del gasto
			nuevoGasto.innerHTML = `
				${nombreGasto} <span class="badge badge-primary badge-pill">$${cantidadGasto}</span>
			`;

			// Boton para borrar el gasto
			const btnBorrar = document.createElement('button');
			btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
			btnBorrar.innerHTML = 'Borrar &times;';
			btnBorrar.onclick = () => {
				eliminarGasto(id);
			};

			nuevoGasto.appendChild(btnBorrar);

			// Agregar al html
			gastoListado.appendChild(nuevoGasto);
		});
	}

	actualizarRestante(restante) {
		document.querySelector('#restante').textContent = restante;
	}

	comprobarPresupuesto(presupuestoInsertadoObj) {
		const { presupuesto, restante } = presupuestoInsertadoObj;
		const restanteDiv = document.querySelector('.restante');

		// Comprobar el 25%
		if (presupuesto / 4 > restante) {
			restanteDiv.classList.remove('alert-success', 'alert-warning');
			restanteDiv.classList.add('alert-danger');
		} else if (presupuesto / 2 >= restante) {
			restanteDiv.classList.remove('alert-success');
			restanteDiv.classList.add('alert-warning');
		} else {
			restanteDiv.classList.remove('alert-danger', 'alert-warning');
			restanteDiv.classList.add('alert-success');
		}

		if (restante <= 0) {
			ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
			const boton = document.querySelector('#enviar');
			boton.disabled = true;
		}
	}
}

const ui = new UI();
let presupuestoInsertado;

// * FUNCIONES
function preguntarPresupuesto() {
	const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');
	// console.log(presupuestoUsuario);

	if (
		presupuestoUsuario === '' ||
		presupuestoUsuario === null ||
		isNaN(presupuestoUsuario) ||
		presupuestoUsuario <= 0
	) {
		window.location.reload();
	}

	// Una vez tenemos un presupuesto válido, lo instanciamos a su clase
	presupuestoInsertado = new Presupuesto(presupuestoUsuario);

	ui.insertarPresupuesto(presupuestoInsertado);
}

function agregarGasto(e) {
	e.preventDefault();

	const nombreGasto = document.querySelector('#gasto').value;
	const cantidadGasto = Number(document.querySelector('#cantidad').value);
	const { presupuesto } = presupuestoInsertado;

	if (nombreGasto === '' || cantidadGasto === '') {
		ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
		return;
	} else if (cantidadGasto <= 0 || isNaN(cantidadGasto)) {
		ui.imprimirAlerta('La cantidad insertada no es válida', 'error');
		return;
	} else if (cantidadGasto > presupuesto) {
		ui.imprimirAlerta(`El gasto "${nombreGasto}" sobrepasa su presupuesto`, 'error');
		return;
	}
	// Generar un objeto de los gastos
	const gasto = {
		nombreGasto,
		cantidadGasto,
		id: Date.now(),
	};

	// Agregando un nuevo gasto
	presupuestoInsertado.nuevoGasto(gasto);
	// console.log(gasto);

	ui.imprimirAlerta(`El gasto de "${nombreGasto}" se agregó a la Lista`);

	// Imprimir los gastos
	const { gastos, restante } = presupuestoInsertado;
	ui.mostrarGastos(gastos);

	ui.actualizarRestante(restante);

	ui.comprobarPresupuesto(presupuestoInsertado);

	// Reiniciar el formulario
	formulario.reset();
}

function limpiarHTML() {
	while (gastoListado.firstChild) {
		gastoListado.removeChild(gastoListado.firstChild);
	}
}

function eliminarGasto(id) {
	// Elimina de la clase
	presupuestoInsertado.eliminarGasto(id);

	// Elimina los gastos del html
	const { gastos, restante } = presupuestoInsertado;
	ui.mostrarGastos(gastos);

	ui.actualizarRestante(restante);

	ui.comprobarPresupuesto(presupuestoInsertado);
}
