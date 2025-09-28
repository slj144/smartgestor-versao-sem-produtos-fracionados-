import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import readXlsxFile from 'read-excel-file';

// Services
import { CustomersService } from '../../../../../customers.service';

// Translate
import { CustomersTranslate } from '../../../../../customers.translate';

// Interfaces
import { IRegistersCustomer } from '@shared/interfaces/IRegistersCustomer';
import { EPersonType } from '@shared/enum/EPersonType';

// Utilities
import { Utilities } from '@shared/utilities/utilities';

@Component({
    selector: 'customers-data-import',
    templateUrl: './dataImport.component.html',
    styleUrls: ['./dataImport.component.scss']
})
export class CustomersDataImportComponent implements OnInit {

    @Output() public callback: EventEmitter<any> = new EventEmitter();

    public translate = CustomersTranslate.get()['modal']['action']['others']['dataImport'];

    public records: any[] = [];
    public valid = false;

    constructor(
        private customersService: CustomersService
    ) { }

    ngOnInit() {
        this.callback.emit({ instance: this });
    }

    bootstrap() {
        this.records = [];
        this.valid = false;
        const input = document.getElementById('inputXLSFile') as HTMLInputElement;
        if (input) { input.value = ''; }
    }

    onFileChange(event: any) {
        const file: File = event.target.files[0];
        this.records = [];
        this.valid = false;

        if (!file) { return; }

        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            alert('Por favor, selecione um arquivo com extensão ".xlsx".');
            event.target.value = '';
            return;
        }

        const schema = {
            'NOME': { prop: 'name' },
            'EMAIL': { prop: 'email' },
            'TELEFONE': { prop: 'phone' },
            'CODIGO': { prop: 'code' },
            'CEP': { prop: 'postalCode' },
            'LOGRADOURO': { prop: 'local' },
            'NUMERO': { prop: 'number' },
            'COMPLEMENTO': { prop: 'complement' },
            'BAIRRO': { prop: 'neighborhood' },
            'CIDADE': { prop: 'city' },
            'UF': { prop: 'state' },
            'DATA_NASCIMENTO': { prop: 'birthDate' }  // ← ADICIONE ESTA LINHA
        } as const;

        readXlsxFile(file, { schema }).then((data) => {
            this.records = data.rows;
            this.valid = this.records.length > 0;
        }).catch(() => {
            alert('Não foi possível ler o arquivo selecionado.');
        });
    }

    async onImport() {
        if (!this.valid || this.records.length === 0) { return; }

        Utilities.loading();
        for (const row of this.records) {
            const customer: IRegistersCustomer = {
                name: (row.name || '').toString().trim(),
                type: EPersonType.naturalPerson
            };

            if (row.code) { customer.code = row.code; }
            // ADICIONE ESTA LINHA para incluir data de nascimento
            if (row.birthDate) { customer.birthDate = row.birthDate; }
            if (row.email || row.phone) {
                customer.contacts = {};
                if (row.email) { customer.contacts.email = row.email.toString().trim().toLowerCase(); }
                if (row.phone) { customer.contacts.phone = row.phone.toString().trim(); }
            }

            if (
                row.postalCode || row.local || row.number || row.complement ||
                row.neighborhood || row.city || row.state
            ) {
                customer.address = {
                    postalCode: row.postalCode || '',
                    local: row.local || '',
                    number: row.number || '',
                    complement: row.complement || '',
                    neighborhood: row.neighborhood || '',
                    city: row.city || '',
                    state: row.state || '',
                    country: ''
                } as any;
            }

            await this.customersService.registerCustomer(customer);
        }
        Utilities.loading(false);
        alert(`${this.records.length} cliente(s) importado(s) com sucesso.`);
        this.callback.emit({ close: true });
    }
}
