import { Page, Locator } from '@playwright/test';

export class ModalCrearCuenta {
  readonly page: Page;
  readonly modalTitle: Locator;
  readonly tipoDeCuentaDropdown: Locator;
  readonly montoInicial: Locator;
  readonly botonCancelar: Locator;
  readonly botonCrearCuenta: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalTitle = page.getByTestId('titulo-modal-crear-cuenta')
    this.tipoDeCuentaDropdown = page.getByRole('combobox', { name: 'Tipo de cuenta *' })
    this.montoInicial = page.getByRole('spinbutton', { name: 'Monto inicial *' });
    this.botonCancelar = page.getByTestId('boton-cancelar-crear-cuenta');
    this.botonCrearCuenta = page.getByTestId('boton-crear-cuenta');
  }

  async seleccionarTipoDeCuenta(tipoDeCuenta: string) {
    await this.tipoDeCuentaDropdown.click();
    await this.page.getByRole('option', { name: tipoDeCuenta }).click();
  }

  async ingresarMontoInicial(monto: string) {
    await this.montoInicial.fill(monto);
  }

}
