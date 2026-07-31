import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly dashboardTitle: Locator;
  readonly botonAgregarCuenta: Locator;
  readonly botonEnviarDinero: Locator;
  readonly elementosListaTransferencia: Locator;
  readonly montosListaTransferencia: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardTitle = page.getByTestId('titulo-dashboard');
    this.botonAgregarCuenta = page.getByTestId('tarjeta-agregar-cuenta');
    this.botonEnviarDinero = page.getByTestId('boton-enviar');
    this.elementosListaTransferencia = page.locator('[data-testid="descripcion-transaccion"]');
    this.montosListaTransferencia = page.locator('[data-testid="monto-transaccion"]');
  }

  async visitarPaginaDashboard() {
    await this.page.goto('http://localhost:3000/dashboard');
    await this.page.waitForLoadState('networkidle');
  }
}
