// VARIABLES Y SELECTORES
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

// EVENTOS
eventListener();
function eventListener() {
	document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

	formulario.addEventListener('submit', agregarGasto);
}

// CLASES
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
		const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
		this.restante = this.presupuesto - gastado;

		// console.log(this.restante);
	}

	eliminarGasto(id) {
		this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
		this.calcularRestante();

		// console.log(this.gastos);
	}
}

// acá irán metodos que imprimirán el html
class UI {
	insertarPresupuesto(cantidad) {
		// extrayendo el valor
		const { presupuesto, restante } = cantidad;
		// agregar al html
		document.querySelector('#total').textContent = presupuesto;
		document.querySelector('#restante').textContent = restante;
	}

	imprimirAlerta(mensaje, tipo) {
		// crear el div
		const divMensaje = document.createElement('div');
		divMensaje.classList.add('text-center', 'alert');

		if (tipo === 'error') {
			divMensaje.classList.add('alert-danger');
		} else {
			divMensaje.classList.add('alert-success');
		}

		// mensaje de error
		divMensaje.textContent = mensaje;

		// insertar en el html
		document.querySelector('.primario').insertBefore(divMensaje, formulario);

		setTimeout(() => {
			divMensaje.remove();
		}, 3000);
	}

	mostrarGastos(gastos) {
		// eliminar html previo para que no se repita el anterior registro cuando se inserta uno nuevo
		this.limpiarHTML();

		// iterar sobre los gastos para mostrar en el html
		gastos.forEach((gasto) => {
			// console.log(gasto);
			const { nombreGasto, cantidad, id } = gasto;

			// crear un li
			const nuevoGasto = document.createElement('li');
			nuevoGasto.className =
				'list-group-item d-flex justify-content-between align-items-center';
			// nuevoGasto.setAttribute('data-id', id);
			nuevoGasto.dataset.id = id;
			// console.log(nuevoGasto);

			// agregar al html
			nuevoGasto.innerHTML = `${nombreGasto} <span class="badge badge-primary badge-pill">$ ${cantidad}</span>`;

			// boton para borrar gasto
			const btnBorrar = document.createElement('button');
			btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
			btnBorrar.onclick = () => {
				eliminarGasto(id);
			};
			btnBorrar.innerHTML = '&times;';

			// para insertarlo en la linea del gasto
			nuevoGasto.appendChild(btnBorrar);

			// agregar boton al html
			gastoListado.appendChild(nuevoGasto);
		});
	}

	limpiarHTML() {
		while (gastoListado.firstChild) {
			gastoListado.removeChild(gastoListado.firstChild);
		}
	}

	actualizarRestante(restante) {
		document.querySelector('#restante').textContent = restante;
	}

	comprobarPresupuesto(presupuestoObj) {
		const { presupuesto, restante } = presupuestoObj;
		const restanteDiv = document.querySelector('.restante');

		// comprobar el 25%
		if (presupuesto / 4 > restante) {
			restanteDiv.classList.remove('alert-success', 'alert-warning');
			restanteDiv.classList.add('alert-danger');
		} else if (presupuesto / 2 > restante) {
			restanteDiv.classList.remove('alert-success');
			restanteDiv.classList.add('alert-warning');
		} else {
			restanteDiv.classList.remove('alert-danger', 'alert-warning');
			restanteDiv.classList.add('alert-success');
		}

		// si el total es 0
		if (restante <= 0) {
			ui.imprimirAlerta('El presupuesto se ha agotado', 'error');

			// deshabilitar el boton de agregar gastos
			formulario.querySelector('button[type="submit"]').disabled = true;
		}
	}
}

// instanciar
const ui = new UI();
let presupuesto;

// FUNCIONES
function preguntarPresupuesto() {
	const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');
	// console.log(Number(presupuesto));

	if (
		presupuestoUsuario === '' ||
		presupuestoUsuario === null ||
		isNaN(presupuestoUsuario) ||
		presupuestoUsuario <= 0
	) {
		window.location.reload();
	}
	presupuesto = new Presupuesto(presupuestoUsuario);
	console.log(presupuesto);

	ui.insertarPresupuesto(presupuesto);
}

function agregarGasto(e) {
	e.preventDefault();

	// leer los datos del formulario
	const nombreGasto = document.querySelector('#gasto').value;
	const cantidad = Number(document.querySelector('#cantidad').value);

	// validar los datos
	if (nombreGasto === '' || cantidad === '') {
		// console.log('Ambos campos son obligatorio');
		ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
		return;
	} else if (cantidad <= 0 || isNaN(cantidad)) {
		ui.imprimirAlerta('Cantidad no valida', 'error');
		return;
	}

	// generar un objeto para los gastos
	const gasto = { nombreGasto, cantidad, id: Date.now() };

	// añadiendo nuevo gasto
	presupuesto.nuevoGasto(gasto);

	// mensaje de correcto
	ui.imprimirAlerta('Gasto agregado a la lista', 'correcto');

	// imprimir los gastos
	const { gastos, restante } = presupuesto;
	ui.mostrarGastos(gastos);
	ui.actualizarRestante(restante);
	ui.comprobarPresupuesto(presupuesto);

	// reiniciar formulario
	formulario.reset();
}

// ELIMINAR GASTO
function eliminarGasto(id) {
	// eliminar los gastos del objeto
	presupuesto.eliminarGasto(id);

	// eliminar los gastos del html
	const { gastos, restante } = presupuesto;
	ui.mostrarGastos(gastos);

	// actualizar el restante por el reembolso
	ui.actualizarRestante(restante);
	ui.comprobarPresupuesto(presupuesto);
}
