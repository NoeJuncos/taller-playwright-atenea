import { Page, Locator } from '@playwright/test';
import testData from '../data/testData.json'

export class ModalEnviarTransferencia {
  readonly page: Page;
  readonly modalTitle: Locator;
  readonly emailDestinatario: Locator;
  readonly cuentaOrigenDropdown: Locator;
  readonly montoAEnviar: Locator;
  readonly botonEnviar: Locator;
  readonly botonCancelar: Locator;
  readonly cuentaOrigenOption: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalTitle = page.getByRole('heading', { name: 'Enviar transferencia' })
    this.emailDestinatario = page.getByRole('textbox', { name: 'Email del destinatario *' })
    this.cuentaOrigenDropdown = page.getByRole('combobox', { name: 'Cuenta origen *' })
    this.montoAEnviar = page.getByRole('spinbutton', { name: 'Monto a enviar *' })
    this.botonEnviar = page.getByRole('button', { name: 'Enviar' })
    this.botonCancelar = page.getByRole('button', { name: 'Cancelar' })
    this.cuentaOrigenOption = page.getByRole('option', { name: '••••' })
  }

  async completarFormularioEnvioTransferenciaYClickBotonEnviar(emailDestinatario: string, monto: string) {
    await this.emailDestinatario.fill(emailDestinatario);
    await this.cuentaOrigenDropdown.click();
    await this.cuentaOrigenOption.click();
    await this.montoAEnviar.fill(monto);
    await this.botonEnviar.click();
   
  }

}
